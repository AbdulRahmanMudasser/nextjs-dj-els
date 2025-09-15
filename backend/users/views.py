from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
import requests
import json
from .models import UserProfile, StudentProfile, FacultyProfile, ParentProfile, LibrarianProfile
from .serializers import (
    UserProfileSerializer, StudentProfileSerializer, FacultyProfileSerializer,
    ParentProfileSerializer, LibrarianProfileSerializer, UserRegistrationSerializer,
    LoginSerializer
)


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user profiles
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter profiles based on user permissions
        """
        try:
            if hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'ADMIN':
                return UserProfile.objects.all()
            else:
                return UserProfile.objects.filter(user=self.request.user)
        except UserProfile.DoesNotExist:
            return UserProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get current user's profile with role-specific data
        """
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            
            # Add role-specific profile data
            data = serializer.data
            if profile.role == 'STUDENT' and hasattr(profile, 'student_profile'):
                data['student_profile'] = StudentProfileSerializer(profile.student_profile).data
            elif profile.role == 'FACULTY' and hasattr(profile, 'faculty_profile'):
                data['faculty_profile'] = FacultyProfileSerializer(profile.faculty_profile).data
            elif profile.role == 'PARENT' and hasattr(profile, 'parent_profile'):
                data['parent_profile'] = ParentProfileSerializer(profile.parent_profile).data
            elif profile.role == 'LIBRARIAN' and hasattr(profile, 'librarian_profile'):
                data['librarian_profile'] = LibrarianProfileSerializer(profile.librarian_profile).data
            
            return Response(data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """
        Update current user's profile
        """
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)

    @action(detail=False, methods=['post'])
    def upload_avatar(self, request):
        """
        Upload profile picture
        """
        try:
            profile = UserProfile.objects.get(user=request.user)
            if 'profile_picture' in request.FILES:
                profile.profile_picture = request.FILES['profile_picture']
                profile.save()
                return Response({'message': 'Avatar uploaded successfully'})
            return Response({'error': 'No file provided'}, status=400)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    User registration endpoint
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                # Create user
                user = User.objects.create_user(
                    username=serializer.validated_data['username'],
                    email=serializer.validated_data['email'],
                    password=serializer.validated_data['password'],
                    first_name=serializer.validated_data['first_name'],
                    last_name=serializer.validated_data['last_name']
                )
                
                # Create user profile
                profile = UserProfile.objects.create(
                    user=user,
                    role=serializer.validated_data['role'],
                    phone_number=serializer.validated_data.get('phone_number', ''),
                    employee_id=serializer.validated_data.get('employee_id'),
                    student_id=serializer.validated_data.get('student_id'),
                    terms_accepted=serializer.validated_data['terms_accepted'],
                    privacy_policy_accepted=serializer.validated_data['privacy_policy_accepted']
                )
                
                # Create role-specific profile
                role = serializer.validated_data['role']
                if role == 'STUDENT':
                    StudentProfile.objects.create(
                        user_profile=profile,
                        admission_year=serializer.validated_data['admission_year']
                    )
                elif role == 'FACULTY':
                    FacultyProfile.objects.create(
                        user_profile=profile,
                        department=serializer.validated_data['department'],
                        designation=serializer.validated_data.get('designation', 'LECTURER'),
                        qualification=serializer.validated_data.get('qualification', '')
                    )
                elif role == 'PARENT':
                    ParentProfile.objects.create(user_profile=profile)
                elif role == 'LIBRARIAN':
                    LibrarianProfile.objects.create(user_profile=profile)
                
                # Create auth token
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'message': 'User registered successfully',
                    'token': token.key,
                    'user_id': user.id,
                    'username': user.username
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login endpoint - supports both email and username
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email_or_username = serializer.validated_data['email_or_username']
        password = serializer.validated_data['password']
        remember_me = serializer.validated_data.get('remember_me', False)
        
        # Try to authenticate with username first
        user = authenticate(request, username=email_or_username, password=password)
        
        # If username authentication fails, try email authentication
        if user is None:
            try:
                user_obj = User.objects.get(email=email_or_username)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        
        if user is not None:
            if user.is_active:
                login(request, user)
                
                # Update last login IP
                try:
                    profile = user.profile
                    profile.last_login_ip = request.META.get('REMOTE_ADDR')
                    profile.save()
                except UserProfile.DoesNotExist:
                    pass
                
                # Create or get token
                token, created = Token.objects.get_or_create(user=user)
                
                # Set session timeout based on remember_me
                if not remember_me:
                    request.session.set_expiry(0)  # Session expires when browser closes
                
                return Response({
                    'message': 'Login successful',
                    'token': token.key,
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.profile.role if hasattr(user, 'profile') else None
                })
            else:
                return Response({'error': 'Account is disabled'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint
    """
    try:
        # Delete the token
        Token.objects.filter(user=request.user).delete()
        logout(request)
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_permissions(request):
    """
    Get user permissions based on role
    """
    try:
        profile = request.user.profile
        permissions = {
            'role': profile.role,
            'can_manage_users': profile.role == 'ADMIN',
            'can_manage_courses': profile.role in ['ADMIN', 'FACULTY'],
            'can_grade_students': profile.role in ['ADMIN', 'FACULTY'],
            'can_view_grades': profile.role in ['ADMIN', 'FACULTY', 'STUDENT', 'PARENT'],
            'can_communicate': True,  # All users can communicate
            'can_access_admin': profile.role == 'ADMIN',
            'can_manage_library': profile.role in ['ADMIN', 'LIBRARIAN'],
        }
        return Response(permissions)
    except UserProfile.DoesNotExist:
        # Return default permissions for users without profiles
        permissions = {
            'role': 'STUDENT',  # Default role
            'can_manage_users': False,
            'can_manage_courses': False,
            'can_grade_students': False,
            'can_view_grades': True,
            'can_communicate': True,
            'can_access_admin': False,
            'can_manage_library': False,
        }
        return Response(permissions)

