import React, { Component, ReactNode } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { LOGO_CHETTAPAY } from '../constants';
import { CHETTA } from '../theme';

declare const __CHETTAPAY_VERSION__: string;

type StateStatus = 'NONE' | 'LOADING' | 'SUCCESS' | 'ERROR';

interface ModalErrorBoundaryState {
    crashed: boolean;
}

export class ModalErrorBoundary extends Component<{ children: ReactNode; onClose: () => void }, ModalErrorBoundaryState> {
    state: ModalErrorBoundaryState = { crashed: false };

    static getDerivedStateFromError(): ModalErrorBoundaryState {
        return { crashed: true };
    }

    componentDidCatch(error: unknown) {
        console.error('[ChettaPay] Modal crashed:', error);
    }

    render() {
        if (this.state.crashed) {
            this.props.onClose();
            return null;
        }
        return <>{this.props.children}</>;
    }
}

export const ChettaPayModalFooter = () => {
    return (
        <View style={styles.footerContainer}>
            <Text style={styles.protectedText}>Protected by</Text>
            <View style={styles.brandRow}>
                <Image style={styles.footerLogo} source={{ uri: LOGO_CHETTAPAY }} />
                <Text style={styles.brandName}>ChettaPay</Text>
                <Text style={styles.versionText}>v{typeof __CHETTAPAY_VERSION__ !== 'undefined' ? __CHETTAPAY_VERSION__ : '0.0.0'}</Text>
            </View>
        </View>
    );
};

export function ChettaPayOverlay({ children, onCancel }: { children: ReactNode; onCancel: () => void }) {
    return (
        <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
            <View style={StyleSheet.absoluteFillObject}>
                <TouchableWithoutFeedback onPress={onCancel}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <TouchableWithoutFeedback>
                            {children}
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </Modal>
    );
}

interface ModalStatusBannerProps {
    message: string;
    status: StateStatus;
    onCancel?: (() => void) | undefined;
    onRetry?: (() => void) | undefined;
}

export function ModalStatusBanner({ message, status, onCancel, onRetry }: ModalStatusBannerProps) {
    if (!message && status === 'NONE') {
        return <View style={styles.statusEmptyContainer} />;
    }

    const isLoading = status === 'LOADING';

    return (
        <View style={[styles.statusContainer, status === 'ERROR' && styles.statusError, status === 'SUCCESS' && styles.statusSuccess]}>
            <View style={styles.statusMessageRow}>
                {isLoading && <ActivityIndicator size="small" color={CHETTA.amber} style={{ marginRight: 8 }} />}
                {status === 'ERROR' && <Text style={{ color: '#ef4444', marginRight: 8 }}>⚠️</Text>}
                {status === 'SUCCESS' && <Text style={{ color: '#10b981', marginRight: 8 }}>✅</Text>}
                <Text style={[styles.statusText, status === 'ERROR' && { color: '#ef4444' }, status === 'SUCCESS' && { color: '#10b981' }, status === 'LOADING' && { color: CHETTA.amber }]}>
                    {message}
                </Text>
            </View>
            <View style={styles.statusActions}>
                {isLoading && onCancel && (
                    <TouchableOpacity onPress={onCancel} style={styles.statusButton}>
                        <Text style={styles.statusButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
                {status === 'ERROR' && onRetry && (
                    <TouchableOpacity onPress={onRetry} style={styles.statusButton}>
                        <Text style={styles.statusButtonText}>Retry</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: CHETTA.bone,
        marginTop: 16,
    },
    protectedText: {
        fontSize: 14,
        color: CHETTA.clay,
        marginRight: 8,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLogo: {
        width: 18,
        height: 18,
        marginRight: 6,
    },
    brandName: {
        fontSize: 14,
        fontWeight: '700',
        color: CHETTA.ink,
        marginRight: 6,
    },
    versionText: {
        fontSize: 11,
        color: CHETTA.dune,
    },
    statusEmptyContainer: {
        minHeight: 40,
        marginTop: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 14,
        minHeight: 40,
        marginTop: 8,
    },
    statusError: {
        backgroundColor: '#fef2f2',
        borderRadius: 8,
    },
    statusSuccess: {
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
    },
    statusMessageRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '500',
    },
    statusActions: {
        flexDirection: 'row',
    },
    statusButton: {
        marginLeft: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: CHETTA.bone,
        borderRadius: 4,
    },
    statusButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: CHETTA.clay,
    },
});
