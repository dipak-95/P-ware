import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Share } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function TraderDashboardScreen() {
  const { token, logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quotes');

  const fetchData = async () => {
    try {
      // Profile details
      const meRes = await fetch('http://10.0.2.2:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const meData = await meRes.json();
      setProfile(meData.profile);

      // Quotations list
      const quoteRes = await fetch('http://10.0.2.2:5000/api/quotations/trader', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const quoteData = await quoteRes.json();
      setQuotations(quoteData.data);

      // Retailers pool
      const retRes = await fetch('http://10.0.2.2:5000/api/auth/retailers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const retData = await retRes.json();
      setRetailers(retData.data);
    } catch (err) {
      try {
        const meRes = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meRes.json();
        setProfile(meData.profile);

        const quoteRes = await fetch('http://localhost:5000/api/quotations/trader', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const quoteData = await quoteRes.json();
        setQuotations(quoteData.data);

        const retRes = await fetch('http://localhost:5000/api/auth/retailers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const retData = await retRes.json();
        setRetailers(retData.data);
      } catch (error) {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleShareLink = async () => {
    if (!profile?.referralLink) return;
    try {
      await Share.share({
        message: `Register as a B2B retailer under Rajesh Traders using this referral link: ${profile.referralLink}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger share sheet');
    }
  };

  const handleShareQuotation = async (quote) => {
    // Generates a direct download url to share via whatsapp/email
    const downloadUrl = `http://localhost:5000/api/quotations/${quote._id}/download`;
    try {
      await Share.share({
        message: `Quotation details for ${quote.quotationNumber}. Download Quote PDF here: ${downloadUrl}`,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to share quotation');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Referral Info Block */}
      <View style={styles.referralCard}>
        <View style={styles.codeCol}>
          <Text style={styles.label}>Trader Code</Text>
          <Text style={styles.codeText}>{profile?.traderCode || 'TRD-XXXX'}</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareLink}>
          <Text style={styles.shareBtnText}>Share Referral Link</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quotes' && styles.tabActive]}
          onPress={() => setActiveTab('quotes')}
        >
          <Text style={[styles.tabText, activeTab === 'quotes' && styles.tabTextActive]}>
            Quotations ({quotations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'retailers' && styles.tabActive]}
          onPress={() => setActiveTab('retailers')}
        >
          <Text style={[styles.tabText, activeTab === 'retailers' && styles.tabTextActive]}>
            Retailers ({retailers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab lists */}
      {activeTab === 'quotes' ? (
        <FlatList
          data={quotations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.quoteNo}>{item.quotationNumber}</Text>
                <Text style={styles.quoteTotal}>Rs. {item.totalAmount.toLocaleString('en-IN')}</Text>
              </View>
              <Text style={styles.cardDesc}>Derived from Inquiry #{item.inquiryId?.inquiryNumber}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleShareQuotation(item)}>
                  <Text style={styles.actionBtnText}>Share PDF Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No quote sheets generated yet.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={retailers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card} style={{ padding: 16 }}>
              <Text style={styles.retailerCompany}>{item.companyName}</Text>
              <Text style={styles.retailerContact}>Owner: {item.ownerName}</Text>
              <Text style={styles.retailerContact}>Email: {item.userId?.email}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No retailers registered in your pool.</Text>
            </View>
          }
        />
      )}

      {/* Logout helper */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080d1a',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#080d1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeCol: {
    gap: 2,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  codeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  shareBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#06b6d4',
  },
  tabText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteNo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  quoteTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  cardDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  actionBtn: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: 'bold',
  },
  retailerCompany: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  retailerContact: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  logoutBtn: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
