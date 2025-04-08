
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { GooglePlace } from '../types/googlePlace';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_PROJECTIID,
  projectId: import.meta.env.VITE_PROJECTIID,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const searchResultsCollection = collection(db, 'searchResults');
export const leadsCollection = collection(db, 'leads');

// Save search results to Firebase
export const saveSearchResults = async (
  keyword: string,
  location: string,
  results: GooglePlace[]
) => {
  try {
    const searchData = {
      keyword,
      location,
      results: results.map(place => ({
        ...place,
        // Convert nested objects for Firestore compatibility
        geometry: place.geometry ? {
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          }
        } : null,
        timestamp: Timestamp.now()
      })),
      timestamp: Timestamp.now()
    };
    
    await addDoc(searchResultsCollection, searchData);
    return true;
  } catch (error) {
    console.error("Error saving search results:", error);
    return false;
  }
};

// Get previous search results for the same keyword and location
export const getPreviousSearchResults = async (
  keyword: string,
  location: string
): Promise<GooglePlace[]> => {
  try {
    // Query for previous searches with the same keyword and location
    const q = query(
      searchResultsCollection,
      where("keyword", "==", keyword),
      where("location", "==", location)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Extract and combine all results from previous searches
    let allResults: GooglePlace[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.results && Array.isArray(data.results)) {
        allResults = [...allResults, ...data.results];
      }
    });
    
    return allResults;
  } catch (error) {
    console.error("Error getting previous search results:", error);
    return [];
  }
};

// Check if a business is already in our leads database
export const checkLeadExists = async (businessName: string, address: string): Promise<boolean> => {
  try {
    const q = query(
      leadsCollection,
      where("businessName", "==", businessName),
      where("address", "==", address)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if lead exists:", error);
    return false;
  }
};
