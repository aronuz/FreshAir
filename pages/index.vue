 <template>
    <div class="home">
        <section class="hero">
            <h1>Welcome to HVAC Fresh Air</h1>
            <p>Your trusted partner for heating, cooling, and ventilation services</p>
            <p>Providing reliable heating and cooling solutions.</p>
            <h2>Our Services</h2>
            <ul>
                <li>Air Conditioning Installation & Repair</li>
                <li>Heating System Installation & Repair</li>
                <li>Duct Cleaning</li>
                {/* ... other services */}
            </ul>
        </section>
        <NuxtLink to="/booking" class="btn">Book a service</NuxtLink>

        <h2>Gallery</h2>
        <NuxtLink to="/gallery" class="btn">View our work</NuxtLink>

        <button>Get a Free Quote</button>
    </div>
 </template>

<script setup>
// You can add any logic here if needed
</script>

<style scoped>
.home {
    text-align: center;
    padding: 2em;
}
.hero {
  text-align: center;
  padding: 100px 0;
}
.btn {
    display: inline-block;
    padding: 10px 20px;
    margin: 10px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
}
</style>