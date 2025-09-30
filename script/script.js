// 🚩 PASTE YOUR COPIED GOOGLE APPS SCRIPT WEB APP URL HERE 🚩
const scriptURL = 'https://script.google.com/macros/s/AKfycbybcm--vg6YzCZbS_Hkh1IvUXhmSIBVQrSpZIk4CRftHPB44gjQ1lSZC33B2UF0igGKlg/exec'; 

const form = document.getElementById('order-form');
const ordIdInput = document.getElementById('ord-id'); 
const popup = document.getElementById('success-popup');

// --- Utility Functions ---

/**
 * Generates a simple time-based placeholder ID and sets it in the input field.
 */
function generateOrderId() {
    if (ordIdInput) {
        const timestamp = new Date().getTime();
        // Generates a value like ORD-88237
        ordIdInput.value = `ORD-${timestamp.toString().slice(-5)}`;
    }
}

/**
 * Displays the success popup with order details.
 * @param {FormData} formData - The FormData object from the submission.
 * @param {string} finalOrderId - The final Order ID (which is the client-generated ID).
 */
function showPopup(formData, finalOrderId) {
    const orderDisplay = document.querySelector('.order-display');
    
    if (orderDisplay) {
        orderDisplay.innerHTML = `
            <strong>Final Order ID:</strong> <span style="color:#007bff; font-weight:bold;">${finalOrderId}</span><br>
            <strong>Customer:</strong> ${formData.get('CustomerName') || 'N/A'}<br>
            <strong>Base Amount:</strong> Rs${formData.get('Amount') || '0.00'}
        `;
    }
    
    if (popup) {
        popup.style.display = 'flex';
        popup.focus();
    }
}

/**
 * Hides the success popup.
 */
function closePopup() {
    if (popup) {
        popup.style.display = 'none';
    }
}

// Attach the global closePopup function to the window object
window.closePopup = closePopup;


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    generateOrderId(); 
});

// --- Form Submission Logic ---

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
        }

        const formData = new FormData(form);
        // CRITICAL FIX: Get the client-generated ID to use in the success popup
        const clientOrderId = formData.get('Temporary_ORD_ID'); 

        fetch(scriptURL, { 
            method: 'POST', 
            // Use FormData directly for POST requests
            body: formData 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); 
        })
        .then(data => {
            if (data.result === 'success') {
                // CRITICAL FIX: Use the client-generated ID for the popup
                showPopup(formData, clientOrderId);
                
                form.reset(); 
                const dateInput = document.getElementById('date');
                if (dateInput) {
                    dateInput.valueAsDate = new Date();
                }
                generateOrderId(); 
            } else {
                alert(`Submission Error: ${data.error || 'Unknown server error.'}`); 
            }
        })
        .catch(error => {
            console.error('Submission Error:', error);
            alert('An internal error occurred. Error: ' + error.message);
        })
        .finally(() => {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Order';
            }
        });
    });
}