import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { KmSplit } from '../../types';

interface KilometerSplitsTableProps {
  splits: KmSplit[];
}

export default function KilometerSplitsTable({ splits }: KilometerSplitsTableProps) {
  if (!splits || splits.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Kilometer Splits</Text>

      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.kmCol]}>Km</Text>
        <Text style={[styles.headerCell, styles.paceCol]}>Pace</Text>
        <View style={styles.barColPlaceholder} />
        <Text style={[styles.headerCell, styles.elevCol]}>Elev</Text>
        <Text style={[styles.headerCell, styles.hrCol]}>HR</Text>
      </View>

      {/* Table Rows */}
      {splits.map((split) => {
        const elevDisplay =
          split.elevationMeters > 0
            ? `+${split.elevationMeters}`
            : split.elevationMeters === 0
            ? '-0'
            : `${split.elevationMeters}`;

        return (
          <View key={`split_${split.km}`} style={styles.splitRow}>
            {/* Km Number */}
            <Text style={[styles.cellText, styles.kmCol]}>{split.km}</Text>

            {/* Pace (e.g. 3:45) */}
            <Text style={[styles.cellText, styles.paceCol, styles.paceText]}>
              {split.pace.replace(' /km', '')}
            </Text>

            {/* Graphic Bar (Relative speed / pace indicator) */}
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.paceBar,
                  { width: `${Math.min(100, Math.max(30, split.barPercentage))}%` },
                ]}
              />
            </View>

            {/* Elevation Difference */}
            <Text style={[styles.cellText, styles.elevCol, styles.secondaryText]}>
              {elevDisplay}
            </Text>

            {/* Heart Rate */}
            <Text style={[styles.cellText, styles.hrCol, styles.secondaryText]}>
              {split.heartRate || 148}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    marginBottom: 6,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  kmCol: {
    width: 28,
    textAlign: 'left',
  },
  paceCol: {
    width: 48,
    textAlign: 'left',
  },
  barColPlaceholder: {
    flex: 1,
  },
  elevCol: {
    width: 38,
    textAlign: 'right',
  },
  hrCol: {
    width: 38,
    textAlign: 'right',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cellText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  paceText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  barContainer: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  paceBar: {
    height: 12,
    backgroundColor: Colors.primary, // AVFIT Forest Green pace bar
    borderRadius: 6,
  },
});
