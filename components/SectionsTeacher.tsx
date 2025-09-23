import React from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ListRenderItem,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 2. Updated the font loading call
Ionicons.loadFont();

const { width } = Dimensions.get('window');

interface Teacher {
  teacher_id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  profile_picture: string | null;
  assigned_subjects: string | null;
  class_assignments: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SectionTeacherViewProps {
  section_teachers: Teacher[];
}

export default function SectionTeacherView({ section_teachers }: SectionTeacherViewProps): React.JSX.Element {
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTeacherCard: ListRenderItem<Teacher> = ({ item }) => (
    <TouchableOpacity style={styles.teacherCard} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {item.profile_picture ? (
              <Image 
                source={{ uri: item.profile_picture }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.nameSection}>
            <Text style={styles.teacherName}>{item.name}</Text>
            <Text style={styles.teacherEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'Active' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        {/* 3. Replaced MaterialIcons with Ionicons and updated icon names */}
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#e11b23" />
          <Text style={styles.infoText}>{item.mobile_number || 'N/A'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="book-outline" size={16} color="#e11b23" />
          <Text style={styles.infoText}>
            Subjects: {item.assigned_subjects || 'Not Assigned'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          Updated: {formatDate(item.updated_at)}
        </Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#e11b23" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = (): React.JSX.Element => (
    <View style={styles.emptyContainer}>
      <Ionicons name="person-remove-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No teachers found</Text>
    </View>
  );
  
  const renderSeparator = (): React.JSX.Element => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teachers List</Text>
        <Text style={styles.headerCount}>
          {section_teachers?.length || 0} Teachers
        </Text>
      </View>
      
      <FlatList<Teacher>
        data={section_teachers || []}
        renderItem={renderTeacherCard}
        keyExtractor={(item: Teacher) => item.teacher_id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: {
    color: '#282c3f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerCount: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  teacherCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#e11b23',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e11b23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameSection: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  actionButton: {
    padding: 4,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});