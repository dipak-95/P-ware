import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CatalogScreen() {
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const endpoint = search
        ? `http://10.0.2.2:5000/api/catalog/products?limit=100&search=${encodeURIComponent(search)}`
        : `http://10.0.2.2:5000/api/catalog/products?limit=100`;

      const response = await fetch(endpoint);
      const data = await response.json();
      setProducts(data.data);
    } catch (err) {
      try {
        const endpoint = search
          ? `http://localhost:5000/api/catalog/products?limit=100&search=${encodeURIComponent(search)}`
          : `http://localhost:5000/api/catalog/products?limit=100`;
        const response = await fetch(endpoint);
        const data = await response.json();
        setProducts(data.data);
      } catch (error) {
        console.error('Failed to load products', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    Alert.alert('Success', `${product.name} added to inquiry cart!`);
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.card}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderImg]}>
          <Text style={{ color: '#64748b', fontSize: 12 }}>No Image</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.code}>{item.code}</Text>
        <Text style={styles.name}>{item.name}</Text>
        
        {/* Specs snippet */}
        <Text style={styles.specsSnippet}>
          {item.specifications ? Object.keys(item.specifications).slice(0,2).map(k => `${k}: ${item.specifications[k]}`).join(' | ') : ''}
        </Text>

        <View style={styles.footerRow}>
          {user && user.role === 'retailer' ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
              <Text style={styles.addBtnText}>Add to Inquiry</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.restrictedText}>Price Restricted</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search wash basin, closets..."
          placeholderTextColor="#64748b"
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#06b6d4" style={{ flex: 1 }} />
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products found in catalog.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProductItem}
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
  searchBarContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  image: {
    width: 110,
    height: 110,
    resizeMode: 'cover',
  },
  placeholderImg: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  code: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  specsSnippet: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  addBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  restrictedText: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
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
