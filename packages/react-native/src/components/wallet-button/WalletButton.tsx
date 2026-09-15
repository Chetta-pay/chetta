import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useChettaPay } from '../../context';
import { WalletButtonTemplate } from './WalletButtonUI'; // Bypassing cache
import { CHETTA, defaultAccent } from '../../theme';

export function WalletButton() {
    const { getClient, walletAddress, styles, openLoginModal, openTxHistoryModal, openWalletBalanceModal } = useChettaPay();
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const { theme = 'light', accentColor = defaultAccent(theme) } = styles;
    const isDark = theme === 'dark';
    const dropdownBg = isDark ? CHETTA.sable : '#fff';
    const dropdownBorder = isDark ? CHETTA.bark : CHETTA.bone;
    const itemColor = isDark ? CHETTA.cream : CHETTA.sable;

    async function handleCopy() {
        if (!walletAddress) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    function handleLogout() {
        setOpen(false);
        getClient().logout();
    }

    function handleWalletBalance() {
        setOpen(false);
        openWalletBalanceModal();
    }

    function handleTxHistory() {
        setOpen(false);
        openTxHistoryModal();
    }

    return (
        <WalletButtonTemplate
            walletAddress={walletAddress ?? null}
            accentColor={accentColor}
            open={open}
            copied={copied}
            dropdownBg={dropdownBg}
            dropdownBorder={dropdownBorder}
            itemColor={itemColor}
            onToggleOpen={() => setOpen((v) => !v)}
            onClose={() => setOpen(false)}
            onCopy={handleCopy}
            onWalletBalance={handleWalletBalance}
            onTxHistory={handleTxHistory}
            onLogout={handleLogout}
            onLogin={openLoginModal}
        />
    );
}
