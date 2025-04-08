
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { GooglePlace } from '../types/googlePlace';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  projectId: import.meta.env.VITE_PROJECT_ID,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
};

console.log('Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? 'API key is set' : 'API key is missing',
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Firebase initialized successfully');

export const searchResultsCollection = collection(db, 'searchResults');
export const leadsCollection = collection(db, 'leads');

// Save search results to Firebase
export const saveSearchResults = async (
  keyword: string,
  location: string,
  results: GooglePlace[]
) => {
  try {
    console.log('Saving search results to Firebase:', { keyword, location, resultsCount: results.length });
    
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
    
    const docRef = await addDoc(searchResultsCollection, searchData);
    console.log('Search results saved with ID:', docRef.id);
    return true;
  } catch (error) {
    console.error("Error saving search results:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

// Get previous search results for the same keyword and location
export const getPreviousSearchResults = async (
  keyword: string,
  location: string
): Promise<GooglePlace[]> => {
  try {
    console.log('Getting previous search results for:', { keyword, location });
    
    // Query for previous searches with the same keyword and location
    const q = query(
      searchResultsCollection,
      where("keyword", "==", keyword),
      where("location", "==", location)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Previous search results query completed, documents count:', querySnapshot.size);
    
    // Extract and combine all results from previous searches
    let allResults: GooglePlace[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Found previous search document:', doc.id);
      if (data.results && Array.isArray(data.results)) {
        allResults = [...allResults, ...data.results];
      }
    });
    
    console.log('Total previous results found:', allResults.length);
    return allResults;
  } catch (error) {
    console.error("Error getting previous search results:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

// Check if a business is already in our leads database
export const checkLeadExists = async (businessName: string, address: string): Promise<boolean> => {
  try {
    console.log('Checking if lead exists:', { businessName, address });
    
    const q = query(
      leadsCollection,
      where("businessName", "==", businessName),
      where("address", "==", address)
    );
    
    const querySnapshot = await getDocs(q);
    const exists = !querySnapshot.empty;
    console.log('Lead exists?', exists);
    return exists;
  } catch (error) {
    console.error("Error checking if lead exists:", error);
    return false;
  }
};
