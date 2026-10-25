import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { AchievementDefinition, TrophyTier } from '../../types';
import {
  Trophy,
  Award,
  Sparkles,
  Share2,
  Check,
  Zap,
  Flame,
  Crown,
} from 'lucide-react-native';

interface TrophyUnlockModalProps {
  visible: boolean;
  achievement: AchievementDefinition | null;
  onClose: () => void;
  onShare?: (achievement: AchievementDefinition) => void;
}

const TIER_COLORS: Record<TrophyTier, { bg: string; border: string; text: string; glow: string }> = {
  bronze: { bg: '#FBF5EE', border: '#CD7F32', text: '#9B5A1A', glow: 'rgba(205, 127, 50, 0.25)' },
  silver: { bg: '#F5F7F8', border: '#A6B2BA', text: '#4B5563', glow: 'rgba(166, 178, 186, 0.3)' },
  gold: { bg: '#FFFBEA', border: '#F59E0B', text: '#B45309', glow: 'rgba(245, 158, 11, 0.35)' },
  platinum: { bg: '#F0F9FF', border: '#0284C7', text: '#0369A1', glow: 'rgba(2, 132, 199, 0.35)' },
  diamond: { bg: '#FDF4FF', border: '#C026D3', text: '#86198F', glow: 'rgba(192, 38, 211, 0.4)' },
};

export default function TrophyUnlockModal({
  visible,
  achievement,
  onClose,
  onShare,
}: TrophyUnlockModalProps) {
  if (!achievement) return null;

  const tierStyle = TIER_COLORS[achievement.tier] || TIER_COLORS.bronze;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Sparkle Banner */}
          <View style={styles.sparkleRow}>
            <Sparkles size={20} color={Colors.accentOrange} />
            <Text style={styles.unlockLabel}>MILESTONE UNLOCKED!</Text>
            <Sparkles size={20} color={Colors.accentOrange} />
          </View>

          {/* Glowing Trophy Badge */}
          <View style={[styles.trophyEmblem, { backgroundColor: tierStyle.bg, borderColor: tierStyle.border }]}>
            {achievement.tier === 'diamond' ? (
              <Crown size={52} color={tierStyle.border} />
            ) : achievement.tier === 'gold' ? (
              <Trophy size={52} color={tierStyle.border} />
            ) : achievement.tier === 'platinum' ? (
              <Award size={52} color={tierStyle.border} />
            ) : achievement.tier === 'silver' ? (
              <Zap size={52} color={tierStyle.border} />
            ) : (
              <Flame size={52} color={tierStyle.border} />
            )}
          </View>

          {/* Tier Pill */}
          <View style={[styles.tierPill, { backgroundColor: tierStyle.border }]}>
            <Text style={styles.tierPillText}>{achievement.tier.toUpperCase()} TROPHY</Text>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>

          {/* Points Reward Box */}
          <View style={styles.pointsBox}>
            <Text style={styles.pointsValue}>+{achievement.points}</Text>
            <Text style={styles.pointsLabel}>AVFIT Community Points</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {onShare && (
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => onShare(achievement)}
                activeOpacity={0.85}
              >
                <Share2 size={18} color={Colors.primary} />
                <Text style={styles.shareButtonText}>Share to Community</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.continueButtonText}>Awesome, Let's Go!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 26, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  unlockLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Colors.accentOrange,
  },
  trophyEmblem: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  pointsBox: {
    backgroundColor: Colors.surfaceWarm,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primarySoft,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(36, 74, 50, 0.15)',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
