import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import {
  Heart,
  MessageCircle,
  Share2,
  Flame,
  Plus,
  Sparkles,
} from 'lucide-react-native';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: 'Maya Lin',
      timeAgo: '2h ago',
      avatarEmoji: '🏃‍♀️',
      badge: 'Stretch & Recovery Done',
      content: 'Completed the 30-min mobility stretch routine! Heart rate stayed at a steady 94 bpm. Feeling grounded and rejuvenated 🌿✨',
      stats: '140 kcal • 30 mins',
      likes: 24,
      comments: 6,
      hasLiked: false,
    },
    {
      id: '2',
      author: 'David Chen',
      timeAgo: '4h ago',
      avatarEmoji: '🥗',
      badge: 'AI Nutrition Scan',
      content: 'Scanned post-workout meal with Gemini AI. 44g protein, salmon & quinoa bowl logged in 3 seconds! 🥑🐟',
      stats: '540 kcal • 44g Protein',
      likes: 19,
      comments: 4,
      hasLiked: true,
    },
  ]);

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            hasLiked: !p.hasLiked,
            likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      })
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Text style={styles.screenTitle}>Fitness Community</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Challenge Announcement Banner */}
        <View style={styles.announcementBanner}>
          <View style={styles.bannerIconCircle}>
            <Sparkles size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>Weekly Step Blitz</Text>
            <Text style={styles.bannerSubtitle}>1,420 members tracking consistency this week</Text>
          </View>
        </View>

        {/* Post Stream */}
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postAuthorRow}>
              <View style={styles.avatarPill}>
                <Text style={{ fontSize: 18 }}>{post.avatarEmoji}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.postTime}>{post.timeAgo}</Text>
              </View>
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementText}>{post.badge}</Text>
              </View>
            </View>

            <Text style={styles.postBody}>{post.content}</Text>

            <View style={styles.statsPill}>
              <Flame size={12} color={Colors.accentOrange} fill={Colors.accentOrange} />
              <Text style={styles.statsText}>{post.stats}</Text>
            </View>

            <View style={styles.actionsBar}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => toggleLike(post.id)}
              >
                <Heart
                  size={16}
                  color={post.hasLiked ? Colors.accentOrange : Colors.textSecondary}
                  fill={post.hasLiked ? Colors.accentOrange : 'transparent'}
                />
                <Text
                  style={[
                    styles.actionText,
                    post.hasLiked && { color: Colors.accentOrange, fontWeight: '800' },
                  ]}
                >
                  {post.likes} High-Fives
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <MessageCircle size={16} color={Colors.textSecondary} />
                <Text style={styles.actionText}>{post.comments} Comments</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <Share2 size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  announcementBanner: {
    backgroundColor: '#F3EDE2',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bannerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F0E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  postTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  achievementBadge: {
    backgroundColor: '#E8F1EC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  achievementText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  postBody: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
    marginBottom: 10,
  },
  statsPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5EFEB',
    paddingTop: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
