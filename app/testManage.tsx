import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  approveMarkAsync,
  bulkApproveMarksAsync,
  clearError,
  fetchAllMarksAsync,
  fetchPendingMarksAsync,
  rejectMarkAsync
} from '@/redux/slice/adminTestMarksSlice';
import { RootState } from '@/redux/store';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface MarksData {
  marks_id: number;
  test_name: string;
  subject_name: string;
  class_name: string;
  section_name: string;
  student_name: string;
  student_email: string;
  marks_obtained: number;
  max_marks: number;
  percentage: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function TestManageScreen() {
  const dispatch = useDispatch();
  const {
    marksData,
    pendingMarks,
    loading,
    error,
    filters,
  } = useSelector((state: RootState) => state.adminTestMarks);

  const [currentView, setCurrentView] = useState<'all' | 'pending'>('pending');
  const [selectedMarks, setSelectedMarks] = useState<number[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedMarkForReject, setSelectedMarkForReject] = useState<MarksData | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (currentView === 'pending') {
      dispatch(fetchPendingMarksAsync());
    } else {
      dispatch(fetchAllMarksAsync(filters));
    }
  }, [currentView, filters]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const handleApproveMark = (marks_id: number) => {
    Alert.alert(
      'Confirm Approval',
      'Are you sure you want to approve this mark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => dispatch(approveMarkAsync(marks_id)),
        },
      ]
    );
  };

  const handleRejectMark = (mark: MarksData) => {
    setSelectedMarkForReject(mark);
    setShowRejectModal(true);
  };

  const confirmRejectMark = () => {
    if (selectedMarkForReject && rejectReason.trim()) {
      dispatch(rejectMarkAsync({
        marks_id: selectedMarkForReject.marks_id,
        reason: rejectReason.trim()
      }));
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedMarkForReject(null);
    } else {
      Alert.alert('Error', 'Please provide a reason for rejection');
    }
  };

  const handleBulkApprove = () => {
    if (selectedMarks.length === 0) {
      Alert.alert('Error', 'Please select marks to approve');
      return;
    }

    Alert.alert(
      'Confirm Bulk Approval',
      `Are you sure you want to approve ${selectedMarks.length} mark(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          onPress: () => {
            dispatch(bulkApproveMarksAsync(selectedMarks));
            setSelectedMarks([]);
          },
        },
      ]
    );
  };

  const toggleMarkSelection = (marks_id: number) => {
    setSelectedMarks(prev =>
      prev.includes(marks_id)
        ? prev.filter(id => id !== marks_id)
        : [...prev, marks_id]
    );
  };

  const renderMarkItem = ({ item }: { item: MarksData }) => {
    const isSelected = selectedMarks.includes(item.marks_id);

    return (
      <View style={styles.markCard}>
        <View style={styles.markHeader}>
          <View style={styles.markInfo}>
            <ThemedText style={styles.studentName}>{item.student_name}</ThemedText>
            <ThemedText style={styles.studentEmail}>{item.student_email}</ThemedText>
          </View>
          {currentView === 'pending' && (
            <TouchableOpacity
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              onPress={() => toggleMarkSelection(item.marks_id)}
            >
              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.markDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Test:</ThemedText>
            <ThemedText style={styles.value}>{item.test_name}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Subject:</ThemedText>
            <ThemedText style={styles.value}>{item.subject_name}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Class:</ThemedText>
            <ThemedText style={styles.value}>{item.class_name} - {item.section_name}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Marks:</ThemedText>
            <ThemedText style={styles.value}>
              {item.marks_obtained}/{item.max_marks} ({item.percentage}%)
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <ThemedText style={styles.statusText}>{item.status}</ThemedText>
            </View>
          </View>
        </View>

        {currentView === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveMark(item.marks_id)}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Approve</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectMark(item)}
            >
              <Ionicons name="close-circle" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Reject</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  const currentData = currentView === 'pending' ? pendingMarks : marksData;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Test Marks Management</ThemedText>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, currentView === 'pending' && styles.toggleButtonActive]}
          onPress={() => setCurrentView('pending')}
        >
          <ThemedText style={[styles.toggleText, currentView === 'pending' && styles.toggleTextActive]}>
            Pending ({pendingMarks.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, currentView === 'all' && styles.toggleButtonActive]}
          onPress={() => setCurrentView('all')}
        >
          <ThemedText style={[styles.toggleText, currentView === 'all' && styles.toggleTextActive]}>
            All Marks ({marksData.length})
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Bulk Actions for Pending View */}
      {currentView === 'pending' && selectedMarks.length > 0 && (
        <View style={styles.bulkActions}>
          <ThemedText style={styles.bulkText}>
            {selectedMarks.length} mark(s) selected
          </ThemedText>
          <TouchableOpacity style={styles.bulkApproveButton} onPress={handleBulkApprove}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <ThemedText style={styles.bulkApproveText}>Approve Selected</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e11b23" />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      )}

      {/* Marks List */}
      {!loading && (
        <FlatList
          data={currentData}
          renderItem={renderMarkItem}
          keyExtractor={(item) => item.marks_id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <ThemedText style={styles.emptyText}>
                {currentView === 'pending' ? 'No pending marks' : 'No marks found'}
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Reject Mark</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Provide a reason for rejecting {selectedMarkForReject?.student_name}'s mark
            </ThemedText>

            <TextInput
              style={styles.reasonInput}
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline={true}
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedMarkForReject(null);
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmRejectMark}
              >
                <ThemedText style={styles.confirmButtonText}>Reject</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#e11b23',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 5,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#e11b23',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: 'white',
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  bulkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  bulkApproveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bulkApproveText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 10,
  },
  markCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  markInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e11b23',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#e11b23',
  },
  markDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: '#e8f5e8',
  },
  statusRejected: {
    backgroundColor: '#ffebee',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
  },
  statusDefault: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  approveButton: {
    backgroundColor: '#4caf50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#f44336',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
