import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function Adduserbyadmin() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const isStudent = role === "Student";
  
  // Initial state based on role
  const initialFormData = isStudent ? {
    email: '',
    name: '',
    role: 'Student',
    mobileNumber: '',
    profilePicture: '',
    guardianName: '',
    guardianMobileNumber: '',
    studentMobileNumber: '',
    dob: '',
    classId: '',
    sectionId: '',
    rollNumber: ''
  } : {
    email: '',
    name: '',
    role: 'Teacher'
  };
  
  const [formData, setFormData] = useState(initialFormData);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    Alert.alert('Success', 'User information saved successfully');
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        Add {isStudent ? 'Student' : 'Teacher'}
      </Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholder="Enter full name"
        />
        
        {!isStudent && (
          <>
            <Text style={styles.label}>Role</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.role}
              editable={false}
            />
          </>
        )}
      </View>
      
      {isStudent && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Details</Text>
            
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.mobileNumber}
              onChangeText={(value) => handleInputChange('mobileNumber', value)}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.label}>Profile Picture URL</Text>
            <TextInput
              style={styles.input}
              value={formData.profilePicture}
              onChangeText={(value) => handleInputChange('profilePicture', value)}
              placeholder="Enter profile picture URL"
            />
            
            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              value={formData.dob}
              onChangeText={(value) => handleInputChange('dob', value)}
              placeholder="YYYY-MM-DD"
            />
            
            <Text style={styles.label}>Class ID *</Text>
            <TextInput
              style={styles.input}
              value={formData.classId}
              onChangeText={(value) => handleInputChange('classId', value)}
              placeholder="Enter class ID"
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Section ID *</Text>
            <TextInput
              style={styles.input}
              value={formData.sectionId}
              onChangeText={(value) => handleInputChange('sectionId', value)}
              placeholder="Enter section ID"
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Roll Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.rollNumber}
              onChangeText={(value) => handleInputChange('rollNumber', value)}
              placeholder="Enter roll number"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guardian Information</Text>
            
            <Text style={styles.label}>Guardian Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.guardianName}
              onChangeText={(value) => handleInputChange('guardianName', value)}
              placeholder="Enter guardian name"
            />
            
            <Text style={styles.label}>Guardian Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.guardianMobileNumber}
              onChangeText={(value) => handleInputChange('guardianMobileNumber', value)}
              placeholder="Enter guardian mobile number"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.label}>Student Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={formData.studentMobileNumber}
              onChangeText={(value) => handleInputChange('studentMobileNumber', value)}
              placeholder="Enter student mobile number"
              keyboardType="phone-pad"
            />
          </View>
        </>
      )}
      
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Save User</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});