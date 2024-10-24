import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManageClassScreen({ route, navigation }) {
  const { classroom } = route.params;
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [editStudent, setEditStudent] = useState(null);
  const [editedStudentName, setEditedStudentName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const storedClassrooms = await AsyncStorage.getItem('classrooms');
      const classrooms = storedClassrooms ? JSON.parse(storedClassrooms) : [];
      const currentClassroom = classrooms.find(c => c.className === classroom.className);
      setStudents(currentClassroom ? currentClassroom.students : []);
    };
    fetchStudents();
  }, [classroom]);

  const addStudent = async () => {
    if (!studentName.trim()) return;

    const newStudent = { name: studentName, attendance: [] };
    const updatedClassroom = {
      ...classroom,
      students: [...students, newStudent],
    };

    const storedClassrooms = await AsyncStorage.getItem('classrooms');
    const classrooms = storedClassrooms ? JSON.parse(storedClassrooms) : [];
    const updatedClassrooms = classrooms.map(c => c.className === classroom.className ? updatedClassroom : c);

    await AsyncStorage.setItem('classrooms', JSON.stringify(updatedClassrooms));
    setStudents(updatedClassroom.students);
    setStudentName('');
  };

  const handleEditStudent = (student) => {
    setEditStudent(student);
    setEditedStudentName(student.name);
    setModalVisible(true);
  };

  const saveEditedStudent = async () => {
    const updatedStudents = students.map(student =>
      student === editStudent ? { ...student, name: editedStudentName } : student
    );

    const updatedClassroom = {
      ...classroom,
      students: updatedStudents,
    };

    const storedClassrooms = await AsyncStorage.getItem('classrooms');
    const classrooms = storedClassrooms ? JSON.parse(storedClassrooms) : [];
    const updatedClassrooms = classrooms.map(c => c.className === classroom.className ? updatedClassroom : c);

    await AsyncStorage.setItem('classrooms', JSON.stringify(updatedClassrooms));
    setStudents(updatedClassroom.students);
    setEditStudent(null);
    setEditedStudentName('');
    setModalVisible(false);
  };

  const handleDeleteStudent = async (studentToDelete) => {
    const updatedStudents = students.filter(student => student !== studentToDelete);

    const updatedClassroom = {
      ...classroom,
      students: updatedStudents,
    };

    const storedClassrooms = await AsyncStorage.getItem('classrooms');
    const classrooms = storedClassrooms ? JSON.parse(storedClassrooms) : [];
    const updatedClassrooms = classrooms.map(c => c.className === classroom.className ? updatedClassroom : c);

    await AsyncStorage.setItem('classrooms', JSON.stringify(updatedClassrooms));
    setStudents(updatedClassroom.students);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do Aluno"
        value={studentName}
        onChangeText={setStudentName}
      />
      <Button title="Adicionar Aluno" onPress={addStudent} />

      <FlatList
        data={students}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.studentName}>{item.name}</Text>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleEditStudent(item)} />
              <Button title="Excluir" onPress={() => handleDeleteStudent(item)} />
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Editar Aluno</Text>
            <TextInput
              style={styles.input}
              value={editedStudentName}
              onChangeText={setEditedStudentName}
            />
            <Button title="Salvar" onPress={saveEditedStudent} />
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
  studentName: {
    fontSize: 18,
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
});