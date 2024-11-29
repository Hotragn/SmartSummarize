const textArea = document.getElementById("text_to_summarize");
const submitButton = document.getElementById("submit-button");
const summarizedTextArea = document.getElementById("summary");
const charCount = document.getElementById("char-count");

// Initial button state
submitButton.disabled = true;

// Event Listeners
textArea.addEventListener("input", verifyTextLength);
submitButton.addEventListener("click", submitData);

function verifyTextLength(e) {
  const textarea = e.target;
  const currentLength = textarea.value.length;

  // Update character counter
  charCount.textContent = currentLength;

  // Enable/disable submit button based on text length
  submitButton.disabled = !(currentLength >= 200 && currentLength <= 100000);

  // Visual feedback on character count
  if (currentLength < 200) {
    charCount.style.color = "#dc2626";
  } else if (currentLength > 100000) {
    charCount.style.color = "#dc2626";
  } else {
    charCount.style.color = "#059669";
  }
}

async function submitData(e) {
  e.preventDefault();

  // Show loading state
  submitButton.disabled = true;
  submitButton.classList.add("submit-button--loading");

  const text_to_summarize = textArea.value;

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+process.env.ACCESS_TOKEN
      },
      body: JSON.stringify({
        "inputs": text_to_summarize,
        "parameters": {
          "max_length": 130,
          "min_length": 30
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Update summary text area
    summarizedTextArea.value = result[0].summary_text;

    // Add success animation
    submitButton.classList.add("success");

  } catch (error) {
    console.error('Error:', error);
    summarizedTextArea.value = "An error occurred while summarizing the text. Please try again.";

    // Add error animation
    submitButton.classList.add("error");

  } finally {
    // Remove loading state
    submitButton.classList.remove("submit-button--loading");
    submitButton.disabled = false;

    // Remove status classes after animation
    setTimeout(() => {
      submitButton.classList.remove("success", "error");
    }, 2000);
  }
}

// Add copy functionality
document.getElementById('copy-btn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(summarizedTextArea.value);
    showToast('Summary copied to clipboard!');
  } catch (err) {
    showToast('Failed to copy text');
  }
});

// Add download functionality
document.getElementById('download-btn').addEventListener('click', () => {
  const text = summarizedTextArea.value;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'summary.txt';
  a.click();
  window.URL.revokeObjectURL(url);
});

// Add share functionality
document.getElementById('share-btn').addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Text Summary',
        text: summarizedTextArea.value
      });
      showToast('Shared successfully!');
    } catch (err) {
      showToast('Error sharing');
    }
  } else {
    showToast('Share feature not supported');
  }
});

// Toast notification function
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  }, 100);
}

