/* =====================================================
   VPL Season 2 – JavaScript
   WhatsApp Booking via imgbb image upload
   ===================================================== */

// ── CONFIG ─────────────────────────────────────────────
// Get a FREE API key at https://imgbb.com/login → API
// Replace the value below with your own imgbb API key.
const IMGBB_API_KEY = "dd2c23b4b58b938a43b8fe9578411bd3"; // ← Replace this
const WHATSAPP_NUMBER = "919427358184";
// ───────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {

  // ── Navbar scroll effect ──────────────────────────────
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  // ── Mobile hamburger ──────────────────────────────────
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
  mobileMenu.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => mobileMenu.classList.remove("open"))
  );

  // ── Reveal on scroll ─────────────────────────────────
  const revealObserver = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  // ── Person Counter ───────────────────────────────────
  let persons = 1;
  const countEl   = document.getElementById("personCount");
  const totalEl   = document.getElementById("totalAmount");
  const decBtn    = document.getElementById("decreaseBtn");
  const incBtn    = document.getElementById("increaseBtn");

  function updateCount(val) {
    persons = Math.max(1, Math.min(val, 50));
    countEl.textContent = persons;
    totalEl.textContent = `₹${persons * 20}`;
  }

  decBtn.addEventListener("click", () => updateCount(persons - 1));
  incBtn.addEventListener("click", () => updateCount(persons + 1));

  // ── File Upload Preview ──────────────────────────────
  const fileInput    = document.getElementById("screenshot");
  const fileUI       = document.getElementById("fileUploadUI");
  const filePreview  = document.getElementById("filePreview");
  const previewImg   = document.getElementById("previewImg");
  const removeBtn    = document.getElementById("removeFile");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      fileUI.style.display = "none";
      filePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.value = "";
    previewImg.src = "";
    filePreview.style.display = "none";
    fileUI.style.display = "block";
  });

  // Drag & drop visual
  const uploadWrap = document.getElementById("fileUploadWrap");
  uploadWrap.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileUI.classList.add("dragover");
  });
  uploadWrap.addEventListener("dragleave", () => fileUI.classList.remove("dragover"));
  uploadWrap.addEventListener("drop", (e) => {
    e.preventDefault();
    fileUI.classList.remove("dragover");
  });

  // ── Form Submission ───────────────────────────────────
  const submitBtn  = document.getElementById("submitBtn");
  const btnText    = document.getElementById("btnText");
  const btnLoader  = document.getElementById("btnLoader");
  const modal      = document.getElementById("successModal");
  const closeModal = document.getElementById("closeModal");

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  submitBtn.addEventListener("click", async () => {
    const name   = document.getElementById("name").value.trim();
    const phone  = document.getElementById("phone").value.trim();
    const file   = fileInput.files[0];

    // Validation
    if (!name)  { showError("Please enter your full name."); return; }
    if (!phone || phone.length < 10) { showError("Please enter a valid 10-digit phone number."); return; }
    if (!file)  { showError("Please upload your payment screenshot."); return; }

    // Loading state
    setLoading(true);

    try {
      let imageUrl = "";

      if (IMGBB_API_KEY && IMGBB_API_KEY !== "YOUR_IMGBB_API_KEY") {
        // Upload to imgbb
        imageUrl = await uploadToImgbb(file);
      } else {
        // Fallback: no image hosting configured, still send text details
        imageUrl = "(Screenshot uploaded – please check WhatsApp)";
      }

      // Build WhatsApp message
      const msg = buildWhatsAppMessage({ name, phone, persons, imageUrl });
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

      // Open WhatsApp
      window.open(waUrl, "_blank");

      // Show success
      modal.style.display = "flex";
      resetForm();

    } catch (err) {
      console.error(err);

      // Even if image upload fails, still open WhatsApp with text details
      const msg = buildWhatsAppMessage({
        name, phone, persons,
        imageUrl: "(Please attach payment screenshot manually)"
      });
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
      modal.style.display = "flex";
      resetForm();
    } finally {
      setLoading(false);
    }
  });

  // ── Helpers ───────────────────────────────────────────

  async function uploadToImgbb(file) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", IMGBB_API_KEY);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData
    });
    const json = await res.json();
    if (!json.success) throw new Error("imgbb upload failed");
    return json.data.url;
  }

  function buildWhatsAppMessage({ name, phone, persons, imageUrl }) {
    const total = persons * 20;
    const lines = [
      "🏏 *VPL Season 2 – 2026*",
      "🎟 *DINNER TICKET BOOKING*",
      "━━━━━━━━━━━━━━━━━━━━",
      `👤 *Name:* ${name}`,
      `📱 *Phone:* ${phone}`,
      `👥 *Number of Persons:* ${persons}`,
      `💰 *Total Amount Paid:* ₹${total}`,
      "━━━━━━━━━━━━━━━━━━━━",
      `🖼 *Payment Screenshot:* ${imageUrl}`,
      "━━━━━━━━━━━━━━━━━━━━",
      "📅 Dinner Details: 31 March 2026, 07.00 PM ",
      "🏟 Savaso Juth Limbach Samaj",
      "",
      "_Please confirm this booking. Thank you!_ 🙏"
    ];
    return lines.join("\n");
  }

  function setLoading(state) {
    submitBtn.disabled = state;
    btnText.style.display  = state ? "none" : "inline";
    btnLoader.style.display = state ? "block" : "none";
  }

  function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    updateCount(1);
    fileInput.value = "";
    previewImg.src = "";
    filePreview.style.display = "none";
    fileUI.style.display = "block";
  }

  function showError(msg) {
    // Simple inline alert styled to match
    const existing = document.getElementById("vpl-error");
    if (existing) existing.remove();

    const err = document.createElement("div");
    err.id = "vpl-error";
    err.style.cssText = `
      background: rgba(255,68,68,0.12);
      border: 1px solid rgba(255,68,68,0.4);
      color: #ff7070;
      border-radius: 10px;
      padding: 12px 16px;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 16px;
      font-family: 'Rajdhani', sans-serif;
    `;
    err.textContent = "⚠️ " + msg;
    submitBtn.parentNode.insertBefore(err, submitBtn);
    setTimeout(() => err.remove(), 4000);
  }

});
