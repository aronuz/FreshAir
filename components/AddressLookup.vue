<template>
    <!-- <UFormField required label="Address" name="address"> -->
        <UInputMenu
            id="address"
            v-model="addressInput" 
            :items="suggestions"
            placeholder="Address"
            @change="selectSuggestion($event)"
            @blur="validateAddress" 
            @focus="addressSubmitted = false"
            @update:searchTerm="handleInput"
        />
    <!-- </UFormField> -->
</template>

<script setup lang="ts">
const addressInput = ref('');
const zipCode = ref('');
const suggestions = ref<InputMenuItem[] | []>([]);
const suggestionObjects = ref<InputMenuItem[]>([]);
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
// Initialize with saved values if provided
if (props.savedAddress && props.savedZip) {
  addressInput.value = `${props.savedAddress} ${props.savedZip}`;
  validateAddress()
}

// Debounced input handler for suggestions
const handleInput = (event) => {
  if (addressSubmitted.value) return

  isValid.value = false;
  lookupError.value = '';
  
  clearTimeout(debounceTimer.value);
  
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
const fetchSuggestions = async (address) => {
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
        suggestions.value = (suggestionObjects.value).map(item => ({
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
const selectSuggestion = (event) => {
    const selectedAddress = suggestionObjects.value.find(item => item.formatted_address === event.formatted_address);
    if (selectedAddress) {
        addressInput.value = selectedAddress.formatted_address;
        zipCode.value = selectedAddress.address_components.zip;
        isValid.value = true;
        lookupError.value = '';     
    }
};

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

const addressLookup = async (opts: { address, limit?: number } = {}) => {
  const { address, limit } = opts
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
        return { error: error.message || 'Uknown error occurred.' };
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