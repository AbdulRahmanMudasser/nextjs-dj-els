from rest_framework import serializers
from .models import (
    DiscussionForum, DiscussionThread, DiscussionReply,
    Notification, PrivateMessage
)


class DiscussionForumSerializer(serializers.ModelSerializer):
    """
    Serializer for DiscussionForum model
    """
    created_by_name = serializers.SerializerMethodField()
    course_offering_name = serializers.CharField(source='course_offering.__str__', read_only=True)
    thread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionForum
        fields = [
            'id', 'course_offering', 'course_offering_name', 'title', 'description',
            'is_general', 'is_private', 'allowed_roles', 'created_by', 'created_by_name',
            'thread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'thread_count']

    def get_created_by_name(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}"

    def get_thread_count(self, obj):
        return obj.threads.count()


class DiscussionThreadSerializer(serializers.ModelSerializer):
    """
    Serializer for DiscussionThread model
    """
    author_name = serializers.SerializerMethodField()
    forum_title = serializers.CharField(source='forum.title', read_only=True)
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionThread
        fields = [
            'id', 'forum', 'forum_title', 'title', 'content', 'author', 'author_name',
            'is_pinned', 'is_locked', 'view_count', 'last_activity', 'reply_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'view_count', 'last_activity', 'created_at', 'updated_at', 'reply_count']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}"

    def get_reply_count(self, obj):
        return obj.replies.count()


class DiscussionReplySerializer(serializers.ModelSerializer):
    """
    Serializer for DiscussionReply model
    """
    author_name = serializers.SerializerMethodField()
    thread_title = serializers.CharField(source='thread.title', read_only=True)
    parent_author_name = serializers.SerializerMethodField()
    child_replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DiscussionReply
        fields = [
            'id', 'thread', 'thread_title', 'parent_reply', 'parent_author_name',
            'content', 'author', 'author_name', 'is_solution', 'upvotes', 'downvotes',
            'child_replies_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'upvotes', 'downvotes', 'created_at', 'updated_at', 'child_replies_count']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}"

    def get_parent_author_name(self, obj):
        if obj.parent_reply:
            return f"{obj.parent_reply.author.first_name} {obj.parent_reply.author.last_name}"
        return None

    def get_child_replies_count(self, obj):
        return obj.child_replies.count()


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'title', 'message', 'notification_type', 'category',
            'read', 'read_at', 'action_url', 'sender', 'sender_name',
            'related_object_type', 'related_object_id', 'expires_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_sender_name(self, obj):
        if obj.sender:
            return f"{obj.sender.first_name} {obj.sender.last_name}"
        return None


class PrivateMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for PrivateMessage model
    """
    sender_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    parent_subject = serializers.CharField(source='parent_message.subject', read_only=True)
    
    class Meta:
        model = PrivateMessage
        fields = [
            'id', 'sender', 'sender_name', 'recipient', 'recipient_name', 'subject',
            'content', 'attachments', 'is_read', 'read_at', 'parent_message',
            'parent_subject', 'is_deleted_by_sender', 'is_deleted_by_recipient',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}"

    def get_recipient_name(self, obj):
        return f"{obj.recipient.first_name} {obj.recipient.last_name}"


class DiscussionForumDetailSerializer(DiscussionForumSerializer):
    """
    Detailed serializer for DiscussionForum with threads
    """
    threads = DiscussionThreadSerializer(many=True, read_only=True)
    
    class Meta(DiscussionForumSerializer.Meta):
        fields = DiscussionForumSerializer.Meta.fields + ['threads']


class DiscussionThreadDetailSerializer(DiscussionThreadSerializer):
    """
    Detailed serializer for DiscussionThread with replies
    """
    replies = DiscussionReplySerializer(many=True, read_only=True)
    
    class Meta(DiscussionThreadSerializer.Meta):
        fields = DiscussionThreadSerializer.Meta.fields + ['replies']