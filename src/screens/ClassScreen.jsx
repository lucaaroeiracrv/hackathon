import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ClassScreen({ navigation }) {
  const [className, setClassName] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [editedClassName, setEditedClassName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchClassrooms = async () => {
      let storedClassrooms = await AsyncStorage.getItem('classrooms');
      storedClassrooms = storedClassrooms ? JSON.parse(storedClassrooms) : [];
      setClassrooms(storedClassrooms);
    };
    fetchClassrooms();
  }, []);

  const addClassroom = async () => {
    if (!className.trim()) return;

    const newClassroom = { className, students: [] };
    const updatedClassrooms = [...classrooms, newClassroom];
    await AsyncStorage.setItem('classrooms', JSON.stringify(updatedClassrooms));
    setClassrooms(updatedClassrooms);
    setClassName('');
  };

  const handleEditClassroom = (classroom) => {
    setEditingClassroom(classroom);
    setEditedClassName(classroom.className);  
    setModalVisible(true);
  };

  const saveEditedClassroom = async () => {
    const updatedClassrooms = classrooms.map(c =>
      c === editingClassroom ? { ...c, className: editedClassName } : c
    );

    await AsyncStorage.setItem('classrooms', JSON.stringify(updatedClassrooms));
    setClassrooms(updatedClassrooms);
    setEditingClassroom(null);
    setEditedClassName('');
    setModalVisible(false);
  };

  const handleDeleteClassroom = async (classroomToDelete) => {
    const updatedClassrooms = classrooms.filter(c => c !== classroomToDelete);

    await AsyncStorage.setItem('classrooms', JSON.stringify(updatedClassrooms));
    setClassrooms(updatedClassrooms);
  };

  const openClassroom = (classroom) => {
    navigation.navigate('ManageClass', { classroom });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome da Turma"
        value={className}
        onChangeText={setClassName}
      />

      <FlatList
        data={classrooms}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity style={styles.itemContent} onPress={() => openClassroom(item)}>
              <Text>{item.className}</Text>
            </TouchableOpacity>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleEditClassroom(item)} />
              <Button title="Excluir" onPress={() => handleDeleteClassroom(item)} />
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

    
      <TouchableOpacity style={styles.addButton} onPress={addClassroom}>
        <Text style={styles.addButtonText}>Adicionar Turma</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Editar Turma</Text>
            <TextInput
              style={styles.input}
              value={editedClassName}
              onChangeText={setEditedClassName}
            />
            <Button title="Salvar" onPress={saveEditedClassroom} />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: '10%',
    right: '10%',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
