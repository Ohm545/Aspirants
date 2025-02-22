// This object holds cities corresponding to each state
const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
    container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
});



// Listen for changes on the state dropdown
document.getElementById('state-select').addEventListener('change', function() {
    var state = this.value;
    var citySelect = document.getElementById('city-select');

    // Clear existing options
    citySelect.innerHTML = '<option value="" disabled selected>City</option>';

    // Define cities for each state
    var cities = {
        "Andhra Pradesh": ["Hyderabad", "Vijayawada", "Visakhapatnam"],
        "Arunachal Pradesh": ["Itanagar", "Tawang", "Bomdila"],
        "Assam": ["Guwahati", "Jorhat", "Dibrugarh"],
        "Bihar": ["Patna", "Gaya", "Bhagalpur"],
        "Chhattisgarh": ["Raipur", "Bilaspur", "Korba"],
        "Goa": ["Panaji", "Vasco da Gama", "Margao"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
        "Haryana": ["Chandigarh", "Gurugram", "Faridabad"],
        "Himachal Pradesh": ["Shimla", "Manali", "Dharamsala"],
        "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad"],
        "Karnataka": ["Bengaluru", "Mysuru", "Hubli"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
        "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Manipur": ["Imphal", "Churachandpur", "Thoubal"],
        "Meghalaya": ["Shillong", "Tura", "Jowai"],
        "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
        "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
        "Punjab": ["Chandigarh", "Amritsar", "Ludhiana"],
        "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur"],
        "Sikkim": ["Gangtok", "Mangan", "Rangpo"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
        "Telangana": ["Hyderabad", "Warangal", "Khammam"],
        "Tripura": ["Agartala", "Udaipur", "Sabroom"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
        "Uttarakhand": ["Dehradun", "Nainital", "Haridwar"],
        "West Bengal": ["Kolkata", "Siliguri", "Durgapur"],
        "Andaman and Nicobar Islands": ["Port Blair", "Havelock", "Neil Island"],
        "Chandigarh": ["Chandigarh"],
        "Dadra and Nagar Haveli": ["Silvassa"],
        "Daman and Diu": ["Daman", "Diu"],
        "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy"],
        "Delhi": ["New Delhi", "Dwarka", "Karol Bagh"],
        "Puducherry": ["Puducherry", "Karaikal", "Mahe"]
    };

    // Get cities for the selected state
    var stateCities = cities[state];

    // Populate city dropdown
    if (stateCities) {
        stateCities.forEach(function(city) {
            var option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
});