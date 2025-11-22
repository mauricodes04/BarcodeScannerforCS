import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const STATUS_OPTIONS = [
  {
    code: 'F',
    label: 'Found',
    icon: 'checkmark-circle',
    color: '#4CAF50',
  },
  {
    code: 'T',
    label: 'Transfer',
    icon: 'swap-horizontal',
    color: '#2196F3',
  },
  {
    code: 'S',
    label: 'Surplus',
    icon: 'archive',
    color: '#FF9800',
  },
  {
    code: 'ST',
    label: 'Stolen',
    icon: 'warning',
    color: '#F44336',
  },
];

const LOCATIONS = [
  { code: 'ALUM', name: 'Alumni Center', color: '#7B68EE' },
  { code: 'ATEC', name: 'Advance Tooling Engineering Center', color: '#FF6B6B' },
  { code: 'CESS', name: 'Community Engagement & Student Success Building', color: '#4ECDC4' },
  { code: 'VABL', name: 'Visual Arts Building', color: '#FFB347' },
  { code: 'ESWOT', name: 'Social Work & Occupational Therapy', color: '#95E1D3' },
  { code: 'EITTB', name: 'International Trade & Technology Building', color: '#F38181' },
  { code: 'ECOXT', name: 'Orville Cox Tennis Center', color: '#AA96DA' },
  { code: 'ETRAK', name: 'Track & Soccer Field', color: '#FCBAD3' },
  { code: 'EPACA', name: 'Performing Arts Complex A', color: '#A8D8EA' },
  { code: 'EPACB', name: 'Performing Arts Complex B', color: '#FFD93D' },
  { code: 'EPACC', name: 'Performing Arts Complex C', color: '#6BCB77' },
  { code: 'ESSBL', name: 'Executive Tower / Student Services Building / Visitors Center', color: '#4D96FF' },
  { code: 'EMASS', name: 'Marialice Shary Shivers Building', color: '#FF8CC8' },
  { code: 'ESTAC', name: 'Student Academic Center', color: '#C4B5FD' },
  { code: 'EUCTR', name: 'University Center', color: '#FCA5A5' },
  { code: 'ECHAP', name: 'Chapel', color: '#86EFAC' },
  { code: 'ESTUN', name: 'Student Union', color: '#93C5FD' },
  { code: 'EDBCX', name: 'Dining & Ballroom Complex', color: '#FDA4AF' },
  { code: 'EHPE2', name: 'Health & Physical Education II', color: '#FDE68A' },
  { code: 'EENGR', name: 'Engineering Building', color: '#A7F3D0' },
  { code: 'EACSB', name: 'Academic Services Building', color: '#BAE6FF' },
  { code: 'EPHYS', name: 'Physical Science Building', color: '#DDD6FE' },
  { code: 'EIMFD', name: 'Intramural Fields', color: '#FBCFE8' },
  { code: 'ETROX', name: 'Troxel Hall', color: '#FED7AA' },
  { code: 'EHRTG', name: 'Heritage Hall', color: '#BBF7D0' },
  { code: 'EEDUC', name: 'Education Complex', color: '#BFDBFE' },
  { code: 'EMAGC', name: 'Mathematics & General Classrooms', color: '#E9D5FF' },
  { code: 'ECCTR', name: 'Computer Center', color: '#FECDD3' },
  { code: 'ECOBE', name: 'Robert C. Vackar College of Business & Entrepreneurship', color: '#FEF08A' },
  { code: 'ECULP', name: 'Central Utility Plant', color: '#99F6E4' },
  { code: 'EHABE', name: 'Health Affairs Building East', color: '#A5F3FC' },
  { code: 'EBNSB', name: 'Behavioral Neurosciences Building', color: '#DDD6FE' },
  { code: 'EHABW', name: 'Health Affairs Building West', color: '#FBCFE8' },
  { code: 'ELABN', name: 'Liberal Arts Building North', color: '#FED7AA' },
  { code: 'EUNTY', name: 'Unity Hall', color: '#BBF7D0' },
  { code: 'EPOB14', name: 'Physical Science Portable 14', color: '#BAE6FF' },
  { code: 'EIEAB', name: 'Interdisciplinary Engineering & Academic Building', color: '#C084FC' },
  { code: 'AWAY', name: 'Away From Campus', color: '#FF6B9D' },
];

export default function StatusSelectionModal({ visible, onClose, onSubmit, barcodeData }) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('EIEAB');
  const [room, setRoom] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  React.useEffect(() => {
    if (visible) {
      setStep(1);
      setStatus('');
      setLocation('EIEAB');
      setRoom('');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  const handleStatusSelect = (selectedStatus) => {
    setStatus(selectedStatus);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setStatus('');
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleLocationSelect = () => {
    setStep(3);
  };

  const handleSubmit = () => {
    onSubmit({
      status,
      location,
      room: room.trim(),
    });
    onClose();
  };

  const selectedStatus = STATUS_OPTIONS.find(option => option.code === status);
  const getStatusColor = (statusCode) =>
    STATUS_OPTIONS.find(option => option.code === statusCode)?.color || '#4A90E2';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.modalContent, {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }]}
        >
          <View style={styles.header}>
            {step > 1 ? (
              <TouchableOpacity onPress={handleBack} style={styles.navButton}>
                <Ionicons name="arrow-back" size={22} color="#d0d0d0" />
              </TouchableOpacity>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}
            <Text style={styles.headerTitle}>
              {step === 1 && 'Select Status'}
              {step === 2 && 'Building'}
              {step === 3 && 'Room Number'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.navButton}>
              <Ionicons name="close" size={22} color="#d0d0d0" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={[styles.contentContainer, step !== 3 && styles.contentContainerCompact]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {step === 1 && (
              <View style={styles.statusButtons}>
                {STATUS_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.code}
                    style={[styles.statusButton, { backgroundColor: option.color }]}
                    onPress={() => handleStatusSelect(option.code)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.statusIconWrapper}>
                      <Ionicons name={option.icon} size={42} color="#fff" />
                    </View>
                    <Text style={styles.statusButtonText}>{option.label}</Text>
                    <Text style={styles.statusButtonCode}>{option.code}</Text>
                    <Text style={styles.statusButtonDescription}>{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === 2 && (
              <View style={styles.locationContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={location}
                    onValueChange={(itemValue) => setLocation(itemValue)}
                    style={styles.picker}
                  >
                    {LOCATIONS.map((loc) => (
                      <Picker.Item
                        key={loc.code}
                        label={`${loc.code} - ${loc.name}`}
                        value={loc.code}
                        color="#ffffff"
                      />
                    ))}
                  </Picker>
                </View>
                <View style={[styles.locationSummary, { backgroundColor: LOCATIONS.find(loc => loc.code === location)?.color || '#383838' }]}>
                  <Ionicons name="location-outline" size={20} color="#fff" />
                  <View style={styles.locationSummaryText}>
                    <Text style={styles.locationCode}>{location}</Text>
                    <Text style={styles.locationName}>
                      {LOCATIONS.find(loc => loc.code === location)?.name}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleLocationSelect}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              <View style={styles.roomContainer}>
                <Text style={styles.label}>Room Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter room number (optional)"
                  value={room}
                  onChangeText={setRoom}
                  autoFocus
                  returnKeyType="done"
                />

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Summary</Text>
                  {selectedStatus && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Status:</Text>
                      <View style={[styles.summaryBadge, { backgroundColor: selectedStatus.color }]}>
                        <Ionicons name={selectedStatus.icon} size={16} color="#fff" style={styles.summaryBadgeIcon} />
                        <Text style={styles.summaryBadgeText}>{selectedStatus.label}</Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Location:</Text>
                    <Text style={styles.summaryValue}>{location}</Text>
                  </View>
                  {room.trim() && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Room:</Text>
                      <Text style={styles.summaryValue}>{room}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: getStatusColor(status) },
                    !status && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!status}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    width: width * 0.9,
    height: '80%',
    borderWidth: 3,
    borderColor: '#404040',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#404040',
  },
  navButton: {
    padding: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(180, 180, 180, 0.15)',
  },
  navButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e0e0e0',
    flex: 1,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  stepDot: {
    width: 24,
    height: 24,
    backgroundColor: '#e7ecf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  stepDotActive: {
    backgroundColor: '#4A90E2',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  stepLineActive: {
    backgroundColor: '#4A90E2',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9aa7c0',
  },
  stepNumberActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  contentContainerCompact: {
    paddingBottom: 12,
  },
  barcodeCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f6f8fc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.15)',
  },
  barcodeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  barcodeCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  barcodeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  barcodeMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    paddingVertical: 20,
  },
  statusButton: {
    width: '45%',
    aspectRatio: 0.95,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 14,
  },
  statusButtonCode: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '600',
  },
  statusButtonDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  statusIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    paddingVertical: 10,
  },
  pickerContainer: {
    backgroundColor: '#383838',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#505050',
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 200,
    color: '#e0e0e0',
  },
  locationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationSummaryText: {
    marginLeft: 12,
    flex: 1,
  },
  locationCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  locationName: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  continueButton: {
    backgroundColor: '#606060',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#707070',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  roomContainer: {
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#383838',
    borderWidth: 3,
    borderColor: '#505050',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#e0e0e0',
  },
  summaryCard: {
    backgroundColor: '#383838',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#505050',
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#b0b0b0',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#e0e0e0',
    fontWeight: '600',
  },
  summaryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryBadgeIcon: {
    marginRight: 4,
  },
  summaryBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 10,
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
