

// Funktion för att hämta menyalternativ för varje kategori och visa dem på sidan
function getMenu() {
    const categories = ['alkoholfritt', 'efterratt', 'forratt', 'huvudratt', 'vin'];
    categories.forEach(category => {
        fetch(`/api/menu/${category}`, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Kunde inte hämta menyalternativ för ${category}.`);
            }
            return response.json();
        })
        .then(menuItems => {
            const menuList = document.getElementById(`menu${capitalize(category)}`);
            if (!menuList) {
                console.error(`Element with id 'menu${capitalize(category)}' not found.`);
                return;
            }
            menuList.innerHTML = '';
            menuItems.forEach(item => {
                const listItem = document.createElement("li");
                const itemContainer = document.createElement("div");
                itemContainer.className = "menu-item";

                const nameElement = document.createElement("span");
                nameElement.className = "menu-item-name";
                nameElement.textContent = item.name;

                const ingredientsElement = document.createElement("span");
                ingredientsElement.className = "menu-item-ingredients";
                ingredientsElement.textContent = item.ingredients;

                const priceElement = document.createElement("span");
                priceElement.className = "menu-item-price";
                priceElement.textContent = ` ${item.price}Kr `;



                itemContainer.appendChild(nameElement);
                itemContainer.appendChild(ingredientsElement);
                itemContainer.appendChild(priceElement);


                listItem.appendChild(itemContainer);
                menuList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error(error);
        });
    });
}


// kapitalisera första bokstaven
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
  document.querySelector(".nav-menu").style.backgroundColor = "#ceeff8";
});
document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  })
);
const meallineItems = document.querySelectorAll(".mealline-item");

meallineItems.forEach((item) => {
const subMenu = item.querySelector(".foodItem"); // Välj undermenyn för varje menuelement

item.addEventListener("click", () => {
// Kolla om menyn är expanderad
const isExpanded = item.classList.contains("expanded");

// Kolla om menyn är redan expanderad
if (!isExpanded) {
  // Stäng alla andra expanderade menyer innan du expanderar den klickade
  meallineItems.forEach((otherItem) => {
    if (otherItem !== item && otherItem.classList.contains("expanded")) {
      otherItem.classList.remove("expanded");
    }
  });
}

// Om menyn är expanderad, dölj den, annars expandera den
item.classList.toggle("expanded");

// Om menyn är expanderad, visa den, annars dölj den
if (!isExpanded) {
  subMenu.style.display = "block";
} else {
  subMenu.style.display = "none";
}
});
});


    // Funktion för att skicka bokningsinformation till servern
    function bookTable(name, numberOfGuests, phone, date, time) {
        fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, numberOfGuests, phone, date, time })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Bokningen misslyckades.');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            document.getElementById("bookingForm").reset();
        })
        .catch(error => {
            console.error(error.message); // Logga felmeddelandet
        });
    }

    document.addEventListener("DOMContentLoaded", function() {
        getMenu();
            const bookingForm = document.getElementById("bookingForm");
            bookingForm.addEventListener("submit", function(event) {
                event.preventDefault(); // Förhindra standardformulärhantering
                
                // Hämta värden från formuläret
                const name = document.getElementById("name").value;
                const numberOfGuests = document.getElementById("numberOfGuests").value;
                const phone = document.getElementById("phone").value;
                const date = new Date(document.getElementById("date").value);
                const time = document.getElementById("time").value;
                
                // Validera telefonnummer (endast siffror)
                const phoneRegex = /^\d+$/;
                if (!phoneRegex.test(phone)) {
                    document.getElementById("phoneError").textContent = "Telefonnumret får endast innehålla siffror";
                    return; // Avbryt bokningen om telefonnumret inte är korrekt
                }
                // Rensa tidigare felmeddelanden om telefonnumret är korrekt
                document.getElementById("phoneError").textContent = "";
                
                // Kontrollera om det är måndag
                if (date.getDay() === 1) {
                    document.getElementById("dateError").textContent = "Restaurangen är stängd på måndagar";
                    return; // Avbryt bokningen om det är måndag
                }
                // Rensa tidigare felmeddelanden om det inte är måndag
                document.getElementById("dateError").textContent = "";
                
                // Kontrollera om datumet är ett förflutet datum
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Nollställ tiden för att jämföra datum
                if (date < today) {
                    document.getElementById("dateError").textContent = "Du kan inte boka för ett förflutet datum";
                    return; // Avbryt bokningen om det är ett förflutet datum
                }
                // Rensa tidigare felmeddelanden om det är ett giltigt datum
                document.getElementById("dateError").textContent = "";
                
                // Kontrollera att tiden är mellan 12:00 och 22:00
                const selectedTime = new Date("1970-01-01T" + time + ":00");
                if (selectedTime.getHours() < 12 || selectedTime.getHours() > 22) {
                    document.getElementById("timeError").textContent = "Restaurangen är öppen mellan 12:00 och 22:00";
                    return; // Avbryt bokningen om tiden inte är inom det tillåtna intervallet
                }
                // Rensa tidigare felmeddelanden om tiden är korrekt
                document.getElementById("timeError").textContent = "";
                
                // Om alla villkor är uppfyllda, skicka bokningsinformationen till servern
                bookTable(name, numberOfGuests, phone, date, time);
            });
        });
        