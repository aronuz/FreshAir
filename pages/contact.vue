  <template>
    <section class="pt-6 pb-3">
        <h2 class="text-3xl font-bold text-gray-800 text-center mb-8">Contact Us</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold bg-gray-100 ml-0 p-4 rounded">
          <div>
            <h3 class="text-xl font-semibold text-gray-700 mb-4">Get in Touch</h3>
            <p class="text-gray-600 mb-4">
              We're here to help with all your HVAC needs. Feel free to reach out to us using the contact information below or by filling out the form.
            </p>
            <div class="mb-4">
              <UIcon name="i-heroicons-map-pin" class="text-primary-500 mr-2" />
              <span class="text-gray-700 font-semibold">Address:</span>
              <p class="text-gray-600 ml-6">123 Main Street, Anytown, NY 10001</p>
            </div>
            <div class="mb-4">
              <UIcon name="i-heroicons-phone" class="text-primary-500 mr-2" />
              <span class="text-gray-700 font-semibold">Phone:</span>
              <p class="text-gray-600 ml-6">(555) 123-4567</p>
            </div>
            <div class="mb-4">
              <UIcon name="i-heroicons-envelope" class="text-primary-500 mr-2" />
              <span class="text-gray-700 font-semibold">Email:</span>
              <p class="text-gray-600 ml-6">info@fahvac.com</p>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-700 mb-2">Business Hours</h4>
              <p class="text-gray-600">Monday - Friday: 9:00 AM to 5:00 PM</p>
              <p class="text-gray-600">Saturday: 10:00 AM to 2:00 PM (Emergency Services Only)</p>
              <p class="text-gray-600">Sunday: Closed</p>
            </div>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-700 mb-4">Send Us a Message</h3>
            <UForm :state="formState" @submit="handleSubmit">
              <UFormGroup label="Name" name="name">
                <UInput v-model="formState.name" placeholder="Your Name" />
              </UFormGroup>
              <UFormGroup label="Email" name="email">
                <UInput v-model="formState.email" type="email" placeholder="Your Email" />
              </UFormGroup>
              <UFormGroup label="Phone" name="phone" optional>
                <UInput v-model="formState.phone" placeholder="Your Phone (Optional)" />
              </UFormGroup>
              <UFormGroup label="Message" name="message">
                <UTextarea v-model="formState.message" placeholder="Your Message" />
              </UFormGroup>
              <UButton type="submit" label="Send Message" color="primary" :loading="loading" />
              <div v-if="submissionSuccess" class="mt-4 text-green-500">
                Message sent successfully! We'll get back to you soon.
              </div>
              <div v-if="submissionError" class="mt-4 text-red-500">
                There was an error sending your message. Please try again later.
              </div>
            </UForm>
          </div>
        </div>
      </section>

      <section class="py-6 mb-8">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">Our Location</h2>
        <div class="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.716780802983!2d-74.00597312373348!3d40.7127753713898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a2e1ddb5d05%3A0xcf469f26915f761!2sWall%20Street!5e0!3m2!1sen!2sus!4v1715165487838!5m2!1sen!2sus"
            width="100%"
            height="450"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
  </template>
  
  <script setup>
  const formState = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
});

const loading = ref(false);
const submissionSuccess = ref(false);
const submissionError = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  submissionSuccess.value = false;
  submissionError.value = false;

  // Simulate sending the form data (replace with your actual API call)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate a successful submission
  const isSuccess = Math.random() > 0.2; // Simulate occasional errors

  if (isSuccess) {
    formState.name = ''
    formState.email = ''
    formState.phone = ''
    formState.message = ''
    submissionSuccess.value = true;
  } else {
    submissionError.value = true;
  }

  loading.value = false;
}

    definePageMeta({
      layout: "default"
    })
  </script>
  
  <style scoped>
  </style>