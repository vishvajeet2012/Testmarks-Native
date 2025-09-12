import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { RootState } from '@/redux/store';
import { createClass } from '@/thunk/classandsection/createClass';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

export default function AddClass() {
    const dispatch = useAppDispatch();
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [classTeacherId, setClassTeacherId] = useState('');
    const [showSectionsModal, setShowSectionsModal] = useState(false);
    
    const { loading, error, successMessage } = useAppSelector((state: RootState) => state.createClass);

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const sections = [
        'Section A',
        'Section B',
        'Section C',
        'Section D',
        'Section E',
        'Section F',
        'Section G',
        'Section H'
    ];

    const handleAddClass = async () => {
        if (!className || !sectionName || !classTeacherId) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const classData = {
            className,
            description,
            section_name: sectionName,
            class_teacher_id: classTeacherId
        };

        
        try {
            await dispatch(createClass(classData)).unwrap();
                        if (!error && successMessage) {
                Alert.alert('Success', successMessage || 'Class added successfully!');
                setClassName('');
                setDescription('');
                setSectionName('');
                setClassTeacherId('');
            }
        } catch (error) {
            console.error('Error adding class:', error);
        }
    };

    const selectSection = (section: string) => {
        setSectionName(section);
        setShowSectionsModal(false);
    };

    const renderSectionItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => selectSection(item)}
        >
            <Text style={styles.sectionItemText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            
            <View style={styles.header}>
                <Text style={[styles.headerText, isDarkMode && styles.darkText]}>
                    Add New Class
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, isDarkMode && styles.darkText]}>
                        Class Name *
                    </Text>
                    <TextInput
                        style={[styles.input, isDarkMode && styles.darkInput]}
                        placeholder="Enter class name"
                        placeholderTextColor={isDarkMode ? '#888' : '#999'}
                        value={className}
                        onChangeText={setClassName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, isDarkMode && styles.darkText]}>
                        Description
                    </Text>
                    <TextInput
                        style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
                        placeholder="Enter class description"
                        placeholderTextColor={isDarkMode ? '#888' : '#999'}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, isDarkMode && styles.darkText]}>
                        Section Name *
                    </Text>
                    <TouchableOpacity
                        style={[styles.input, styles.pickerInput, isDarkMode && styles.darkInput]}
                        onPress={() => setShowSectionsModal(true)}
                    >
                        <Text style={[styles.pickerText, !sectionName && styles.placeholderText]}>
                            {sectionName || 'Select Section'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, isDarkMode && styles.darkText]}>
                        Class Teacher Name *
                    </Text>
                    <TextInput
                        style={[styles.input, isDarkMode && styles.darkInput]}
                        placeholder="Enter teacher ID"
                        placeholderTextColor={isDarkMode ? '#888' : '#999'}
                        value={classTeacherId}
                        onChangeText={setClassTeacherId}
                        keyboardType="numeric"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleAddClass}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Add Class</Text>
                    )}
                </TouchableOpacity>
            </View>

            <Modal
                visible={showSectionsModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSectionsModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
                        <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                            Select Section
                        </Text>
                        <FlatList
                            data={sections}
                            renderItem={renderSectionItem}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowSectionsModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    darkText: {
        color: '#fff',
    },
    form: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    darkInput: {
        backgroundColor: '#333',
        borderColor: '#555',
        color: '#fff',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    pickerInput: {
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
    },
    darkModalContent: {
        backgroundColor: '#333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    sectionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionItemText: {
        fontSize: 16,
        color: '#333',
    },
    closeButton: {
        marginTop: 15,
        padding: 12,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});