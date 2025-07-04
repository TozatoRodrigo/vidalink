import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { Typography } from '../../constants/Typography';

interface Document {
  id: string;
  original_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'pdf' | 'document' | 'other';
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface DocumentViewerProps {
  documents: Document[];
  onDeleteDocument?: (documentId: string) => void;
  editable?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  onDeleteDocument,
  editable = false,
}) => {
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string, mimeType: string) => {
    if (fileType === 'image' || mimeType.startsWith('image/')) {
      return 'image';
    }
    if (fileType === 'pdf' || mimeType === 'application/pdf') {
      return 'document-text';
    }
    if (fileType === 'document' || mimeType.includes('word')) {
      return 'document';
    }
    return 'document-outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { name: 'checkmark-circle', color: Colors.success };
      case 'processing':
        return { name: 'time', color: Colors.warning };
      case 'failed':
        return { name: 'close-circle', color: Colors.error };
      default:
        return { name: 'ellipse', color: Colors.textSecondary };
    }
  };

  const openDocument = async (document: Document) => {
    try {
      const supported = await Linking.canOpenURL(document.file_url);
      if (supported) {
        await Linking.openURL(document.file_url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o documento');
      }
    } catch (error) {
      console.error('Erro ao abrir documento:', error);
      Alert.alert('Erro', 'Falha ao abrir documento');
    }
  };

  const handleDeleteDocument = (documentId: string, documentName: string) => {
    Alert.alert(
      'Remover Documento',
      `Deseja remover "${documentName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onDeleteDocument?.(documentId),
        },
      ]
    );
  };

  if (documents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>Nenhum documento anexado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Documentos Anexados ({documents.length})
      </Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.documentsContainer}
        contentContainerStyle={styles.documentsContent}
      >
        {documents.map((document) => {
          const statusIcon = getStatusIcon(document.processing_status);
          const isImage = document.file_type === 'image' || document.mime_type.startsWith('image/');
          
          return (
            <TouchableOpacity
              key={document.id}
              style={styles.documentItem}
              onPress={() => openDocument(document)}
              activeOpacity={0.7}
            >
              <View style={styles.documentContent}>
                {/* Preview ou Ícone */}
                <View style={styles.documentPreview}>
                  {isImage ? (
                    <Image
                      source={{ uri: document.file_url }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.documentIconContainer}>
                      <Ionicons
                        name={getFileIcon(document.file_type, document.mime_type) as any}
                        size={32}
                        color={Colors.primary}
                      />
                    </View>
                  )}
                  
                  {/* Status Badge */}
                  <View style={styles.statusBadge}>
                    <Ionicons
                      name={statusIcon.name as any}
                      size={16}
                      color={statusIcon.color}
                    />
                  </View>
                </View>

                {/* Informações do Documento */}
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={2}>
                    {document.original_name}
                  </Text>
                  <Text style={styles.documentSize}>
                    {formatFileSize(document.file_size)}
                  </Text>
                  <Text style={styles.documentDate}>
                    {new Date(document.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>

                {/* Botão de Remover */}
                {editable && onDeleteDocument && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDocument(document.id, document.original_name)}
                  >
                    <Ionicons name="close" size={16} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    marginVertical: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  documentsContainer: {
    flexDirection: 'row',
  },
  documentsContent: {
    paddingRight: Spacing.md,
  },
  documentItem: {
    width: 120,
    marginRight: Spacing.sm,
  },
  documentContent: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Spacing.sm,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  documentPreview: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  imagePreview: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    backgroundColor: Colors.backgroundSecondary,
  },
  documentIconContainer: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  documentSize: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
}); 