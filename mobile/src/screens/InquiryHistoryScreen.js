import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function InquiryHistoryScreen() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/inquiries/retailer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setInquiries(data.data);
      } catch (err) {
        try {
          const response = await fetch('http://localhost:5000/api/inquiries/retailer', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          setInquiries(data.data);
        } catch (error) {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchInquiries();
  }, [token]);

  const renderInquiryItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.number}>Inquiry #{item.inquiryNumber}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
      </View>
      <View style={styles.itemsBlock}>
        {item.items.map((prod, idx) => (
          <Text key={idx} style={styles.itemText}>
            &bull; {prod.productId?.name || 'Product'} (Qty: {prod.quantity})
          </Text>
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.statusVal, item.status === 'pending' ? styles.statusPending : styles.statusApproved]}>
          {item.status === 'pending' ? 'Pending rates' : 'Quote compiled (Sent to Trader)'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#06b6d4" style={{ flex: 1 }} />
      ) : inquiries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No inquiries recorded.</Text>
        </View>
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={(item) => item._id}
          renderItem={renderInquiryItem}
          contentContainerStyle={styles.listContainer}
        />
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
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  number: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
  },
  itemsBlock: {
    gap: 4,
  },
  itemText: {
    color: '#f8fafc',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
    gap: 6,
  },
  statusLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  statusVal: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#f59e0b',
  },
  statusApproved: {
    color: '#10b981',
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
