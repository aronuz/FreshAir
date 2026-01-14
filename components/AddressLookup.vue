<template>
    <!-- <UFormField :ui="{ label:'text-gray-600 dark:text-gray-500' }" required label="Address" name="address"> -->
        <UInputMenu
            id="address"
            v-model="addressInputObject"
            placeholder="Address"
            :items="suggestions"
            :disabled="pending"
            :loading="pending"
            @change="selectSuggestion($event)"
            @blur="validateAddress" 
            @focus="addressSubmitted = false"
            @update:searchTerm="handleInput"
        />
    <!-- </UFormField> -->
</template>

<script setup lang="ts">
export interface GeocodioLocation {
  lat: number;
  lng: number;
}
export interface AddressComponents {
  number?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}
export interface GeocodioResult {
  formatted_address: string; // Full human-readable address
  location: GeocodioLocation; // Latitude and longitude
  address_components: AddressComponents; // Optional detailed components
  accuracy: string; // Accuracy level like "rooftop", "street", etc.
  source?: string; // Optional source information
}
export interface Suggestions extends GeocodioResult {
  value: string;
  label: string;
}

const addressInputObject = ref<Suggestions | undefined>(undefined);
const addressInput = ref('');
const zipCode = ref('');
const suggestions = ref<Suggestions[] | [] | undefined>([]);
const suggestionObjects = ref<GeocodioResult[]>([]);
const pending = ref(false);
const isValid = ref(false);
const lookupError = ref('');
const debounceTimer = ref<NodeJS.Timeout | null>(null);
const addressSubmitted = ref(false);

const props = defineProps({
  savedAddress: {
    type: String,
    default: ''
  },
  savedZip: {
    type: String,
    default: ''
  }   
});

watchEffect(() => {
  if (addressInputObject.value) {
    addressInput.value = addressInputObject.value.formatted_address;
  }
});

// Validate address on blur
const validateAddress = async () => {
  if (!addressInput.value.trim()) {
    lookupError.value = 'Address is required';
    return;
  }
  
  pending.value = true;
  suggestionObjects.value = []
  suggestions.value = [];
  addressSubmitted.value = true;
  
   try {
     const data = await addressLookup({address: addressInput.value});

     if (data.error) {
         lookupError.value = data.error;
     } else if (data.results && data.results.length > 0) {
       const topResult = data.results[0];
    
       // Check accuracy score (0-1, where 1 is exact match)
       if (topResult.accuracy >= 0.8) {
         isValid.value = true;
         // Optionally update input with formatted address
         addressInput.value = topResult.formatted_address;
         zipCode.value = topResult.address_components.zip;
       } else {
         lookupError.value = 'Address could not be verified. Please check and try again.';
       }
     } else {
       lookupError.value = 'Invalid address. Please enter a valid US address.';
     }
   } catch (error) {
     lookupError.value = `Error validating address. ${error} Please try again.`;
   } finally {
     pending.value = false
   }
};

// Initialize with saved values if provided
if (props.savedAddress && props.savedZip) {
  addressInput.value = `${props.savedAddress} ${props.savedZip}`;
  validateAddress()
}

// Debounced input handler for suggestions
const handleInput = (event: string) => {
  if (addressSubmitted.value) return

  isValid.value = false;
  lookupError.value = '';
  
  if (debounceTimer.value) clearTimeout(debounceTimer.value);
  
  if (!event || event.trim().length < 3) {
    suggestionObjects.value = []
    suggestions.value = []
    if (!event || event.trim().length === 0) {
        addressInput.value = '';
    }
    return;
  }

  debounceTimer.value = setTimeout(() => {
    addressInput.value = event;  
    fetchSuggestions(event);
  }, 300);
};

// Fetch address suggestions
const fetchSuggestions = async (address: string) => {
  try {
    const data = await addressLookup({address, limit: 5});
    if (data.error) {
        lookupError.value = `${data.error} Address entry: ${address}`;
    } 
    
    if (!data.results || data.results.length === 0) {        
        suggestionObjects.value = [];
        suggestions.value = [];
    } else {
        suggestionObjects.value = data.results;
        suggestions.value = (suggestionObjects.value).map((item: GeocodioResult) => ({
            label: item.formatted_address,
            value: item.formatted_address,
            ...item
        }));
    }
  } catch (error) {
    lookupError.value = `Error fetching suggestions: ${error}`;
    suggestions.value = [];
  }
};

// Handle selection of a suggestion
const selectSuggestion = (event: Event) => {
    const selection = (event.target as HTMLInputElement)?.value;
    const selectedAddress = suggestionObjects.value.find((item: GeocodioResult) => item.formatted_address === selection);
    if (selectedAddress) {
        addressInput.value = selectedAddress.formatted_address;
        zipCode.value = selectedAddress.address_components.zip ?? '';
        isValid.value = true;
        addressInputObject.value = {...selectedAddress, value: selectedAddress.formatted_address, label: selectedAddress.formatted_address};
        lookupError.value = '';     
    }
};

const addressLookup = async (opts: {} | { address: string, limit?: number } = {}) => {
    let address, 
        limit = -1
    if ('address' in opts) {
      address = opts.address
      if ('limit' in opts) opts.limit
    }
    try {
        const response = await fetch("/api/address-lookup", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address,
                limit: typeof limit === 'number' ? limit : -1,
            })
        })

        if (!response.ok) {
          // Try to read error body as text or json for a useful message
          const text = await response.text().catch(() => '')
          try {
            const parsed = JSON.parse(text || '{}')
            return { error: parsed.statusMessage || parsed.message || text || `HTTP ${response.status}` }
          } catch (e) {
            return { error: text || `HTTP ${response.status}` }
          }
        }

        let data = await response.json();

        if (data && data.success) {
          return data.data
        }

        return data
    } catch (error) {
        return { error: error instanceof Error ? error?.message : 'Uknown error occurred.' };
    }
};

// Expose validated data for parent component/form
defineExpose({
    addressInput,
    zipCode,
    addressValid: isValid,
    lookupError
});
</script>