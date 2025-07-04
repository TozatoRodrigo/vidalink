import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { Typography } from '../../constants/Typography';

interface DocumentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (files: Array<{ uri: string; name: string; type: string }>) => Promise<void>;
  healthEventId: string;
}

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  visible,
  onClose,
  onUpload,
  healthEventId,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets) {
        const newFiles: SelectedFile[] = result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: asset.fileName || `imagem_${Date.now()}_${index}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        }));

        setSelectedFiles(prev => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Falha ao selecionar imagem');
    }
  };

  const handleCameraPicker = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para usar a câmera.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newFile: SelectedFile = {
          uri: asset.uri,
          name: asset.fileName || `foto_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        };

        setSelectedFiles(prev => [...prev, newFile]);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Falha ao tirar foto');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles: SelectedFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        }));

        setSelectedFiles(prev => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Falha ao selecionar documento');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um arquivo para enviar');
      return;
    }

    try {
      setUploading(true);
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      onClose();
      Alert.alert('Sucesso', 'Documentos enviados com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar documentos:', error);
      Alert.alert('Erro', 'Falha ao enviar documentos. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'document-text';
    if (type.includes('word')) return 'document';
    return 'document-outline';
  };

  const showPickerOptions = () => {
    Alert.alert(
      'Selecionar Arquivo',
      'Escolha uma opção:',
      [
        { text: 'Câmera', onPress: handleCameraPicker },
        { text: 'Galeria', onPress: handleImagePicker },
        { text: 'Documentos', onPress: handleDocumentPicker },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Anexar Documentos</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Upload Button */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={showPickerOptions}
            disabled={uploading}
          >
            <Ionicons name="cloud-upload" size={32} color={Colors.primary} />
            <Text style={styles.uploadButtonText}>
              Selecionar Arquivos
            </Text>
            <Text style={styles.uploadButtonSubtext}>
              Fotos, PDFs ou documentos
            </Text>
          </TouchableOpacity>

          {/* File Limits Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • Máximo 10MB por arquivo
            </Text>
            <Text style={styles.infoText}>
              • Formatos: JPEG, PNG, PDF, DOC, DOCX, TXT
            </Text>
            <Text style={styles.infoText}>
              • Até 5 arquivos por vez
            </Text>
          </View>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <View style={styles.filesContainer}>
              <Text style={styles.filesTitle}>
                Arquivos Selecionados ({selectedFiles.length})
              </Text>
              
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <View style={styles.fileInfo}>
                    {file.type.startsWith('image/') ? (
                      <Image source={{ uri: file.uri }} style={styles.fileImage} />
                    ) : (
                      <View style={styles.fileIconContainer}>
                        <Ionicons
                          name={getFileIcon(file.type) as any}
                          size={24}
                          color={Colors.primary}
                        />
                      </View>
                    )}
                    
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={2}>
                        {file.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {formatFileSize(file.size)}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => removeFile(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={uploading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.uploadActionButton,
              selectedFiles.length === 0 && styles.disabledButton
            ]}
            onPress={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.uploadActionButtonText}>
                Enviar ({selectedFiles.length})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  uploadButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  uploadButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  uploadButtonSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  infoContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  filesContainer: {
    marginTop: Spacing.md,
  },
  filesTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  uploadActionButton: {
    backgroundColor: Colors.primary,
  },
  uploadActionButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
}); 