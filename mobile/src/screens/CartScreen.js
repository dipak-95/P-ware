import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartScreen({ navigation }) {
  const { token } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [traderCode, setTraderCode] = useState('');

  useEffect(() => {
    // Load trader mapping from profile
    const fetchTrader = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setTraderCode(data.profile?.mappedTraderId?.traderCode || 'TRD-XXXX');
      } catch (err) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          setTraderCode(data.profile?.mappedTraderId?.traderCode || 'TRD-XXXX');
        } catch (error) {
          console.error(error);
        }
      }
    };
    if (token) fetchTrader();
  }, [token]);

  const handleSubmit = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);

    const itemsPayload = cartItems.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch('http://10.0.2.2:5000/api/inquiries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: itemsPayload }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        Alert.alert('Success', 'Inquiry submitted successfully to your Trader!');
        clearCart();
        navigation.navigate('Inquiries');
      } else {
        Alert.alert('Error', data.message || 'Submission failed');
      }
    } catch (err) {
      try {
        const response = await fetch('http://localhost:5000/api/inquiries/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: itemsPayload }),
        });
        const data = await response.json();
        if (data.status === 'success') {
          Alert.alert('Success', 'Inquiry submitted successfully to your Trader!');
          clearCart();
          navigation.navigate('Inquiries');
        } else {
          Alert.alert('Error', data.message || 'Submission failed');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to connect to backend api');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.infoCol}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.code}>Code: {item.product.code}</Text>
      </View>
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => updateQuantity(item.product._id, item.quantity - 1)}>
          <Text style={styles.ctrlBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => updateQuantity(item.product._id, item.quantity + 1)}>
          <Text style={styles.ctrlBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.product._id)}>
          <Text style={styles.removeBtnText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your inquiry cart is empty.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product._id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContainer}
          />

          <View style={styles.summaryContainer}>
            <Text style={styles.traderText}>Mapped Trader Code: {traderCode}</Text>
            {submitting ? (
              <ActivityIndicator size="small" color="#06b6d4" />
            ) : (
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>Submit Inquiry Request</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080d1a',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  code: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctrlBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qty: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 8,
  },
  removeBtnText: {
    color: '#ef4444',
    fontSize: 22,
    fontWeight: '300',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  traderText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#06b6d4',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
