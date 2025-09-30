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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

MaterialIcons.loadFont();

const { width } = Dimensions.get('window');

interface Student {
  student_id: number;
  name: string;
  email: string;
  mobile_number: string;
  profile_picture: string;
  roll_number: string;
  dob: string;
  guardian_name: string;
  guardian_mobile_number: string;
  student_mobile_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DataStudent {
  students: Student[];
}

interface SectionStudentViewProps {
  dataStudent: DataStudent;
}

export default function SectionStudentView({ dataStudent }: SectionStudentViewProps): React.JSX.Element {
    const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  console.log(dataStudent);

  const renderStudentCard: ListRenderItem<Student> = ({ item }) => (
    <TouchableOpacity style={styles.studentCard} activeOpacity={0.8}>
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
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.rollNumber}>Roll: {item.roll_number}</Text>
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
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={16} color="#e11b23" />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={16} color="#e11b23" />
          <Text style={styles.infoText}>{item.mobile_number}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="cake" size={16} color="#e11b23" />
          <Text style={styles.infoText}>DOB: {formatDate(item.dob)}</Text>
        </View>
        
        <View style={styles.guardianSection}>
          <Text style={styles.guardianLabel}>Guardian Details:</Text>
          <View style={styles.guardianInfo}>
            <Text style={styles.guardianName}>{item.guardian_name}</Text>
            <Text style={styles.guardianPhone}>{item.guardian_mobile_number}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          Updated: {formatDate(item.updated_at)}
        </Text>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="more-vert" size={20} color="#e11b23" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = (): React.JSX.Element => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="school" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No students found</Text>
    </View>
  );

  const renderSeparator = (): React.JSX.Element => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students List</Text>
        <Text style={styles.headerCount}>
          {dataStudent?.length || 0} Students
        </Text>
      </View>
      
      <FlatList<Student>
        data={dataStudent || []}
        renderItem={renderStudentCard}
        keyExtractor={(item: Student) => item?.student_id.toString()}
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
   // backgroundColor: '#e11b23',
    paddingHorizontal: 20,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#282c3f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerCount: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  listContainer: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  rollNumber: {
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
    marginBottom: 12,
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
  guardianSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  guardianLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e11b23',
    marginBottom: 4,
  },
  guardianInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guardianName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  guardianPhone: {
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
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
