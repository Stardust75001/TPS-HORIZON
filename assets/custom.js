// ✅ Infobulles sur icônes (mobile uniquement)
document.addEventListener("DOMContentLoaded", function () {
  // ✅ Infobulles sur mobile
  let lastClicked = null;
  document.querySelectorAll('.animated-stories-link').forEach(function (el) {
    el.addEventListener('click', function (e) {
      const tooltip = el.querySelector('.tooltip-bubble');
      if (!tooltip) return;

      const isMobile = window.matchMedia("(hover: none)").matches;

      if (isMobile) {
        if (lastClicked === el && tooltip.classList.contains('visible')) return;

        e.preventDefault();
        document.querySelectorAll('.tooltip-bubble').forEach(tip => tip.classList.remove('visible'));
        tooltip.classList.add('visible');
        lastClicked = el;

        setTimeout(() => {
          tooltip.classList.remove('visible');
          lastClicked = null;
        }, 3000);
      }
    });
  });

  // ✅ Fermer les infobulles au clic hors cible
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.animated-stories-link')) {
      document.querySelectorAll('.tooltip-bubble.visible').forEach(tip => tip.classList.remove('visible'));
      lastClicked = null;
    }
  });

  // ✅ Ajuster le padding-top du <main>
  function updateMainPadding() {
    const headerGroup = document.querySelector('.header-sticky-group');
    const main = document.querySelector('main');
    if (headerGroup && main) {
      main.style.paddingTop = headerGroup.offsetHeight + 'px';
    }
  }
  window.addEventListener('load', updateMainPadding);
  window.addEventListener('resize', updateMainPadding);

  // ✅ Surveiller le bouton de souscription Shopify
  waitForElement('#shopify-subscription-policy-button')
    .then(button => {
      new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.attributeName === 'class' && button.classList.contains('is-checked')) {
            console.log("✅ Bouton de souscription coché");
          }
        }
      }).observe(button, { attributes: true });
    })
    .catch(error => {
      console.warn("❌ Bouton non trouvé :", error);
    });

  // ✅ Vérification de la licence Shopiweb
  try {
    fetch('https://services.shopiweb.fr/api/licenses/get_by_domain/f6d72e-0f.myshopify.com/premium')
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => {
        console.log('✅ Licence Shopiweb valide :', data);
      })
      .catch(error => {
        console.warn('⚠️ Validation de licence échouée : fonctionnement limité', error);
      });
  } catch (error) {
    console.warn('⚠️ Erreur lors du fetch licence Shopiweb', error);
  }
});

// ✅ Utilitaire : attendre l’apparition d’un élément
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout: ${selector}`));
    }, timeout);
  });
}

// ✅ Gestion ATC variante (Add to Cart avec changement de variante)
function handleAtcFormVariantClick(element, event) {
  if (event) event.preventDefault();
  const form = element.closest("form");
  const variantId = element.getAttribute("data-variant-id");

  if (form && variantId) {
    const variantInput = form.querySelector('input[name="id"]');
    if (variantInput) variantInput.value = variantId;

    if (typeof handleAddToCartFormSubmit === 'function') {
      handleAddToCartFormSubmit(form, event);
    } else {
      form.submit();
    }
  }
}

// ✅ Gestion bouton Checkout
function handleCheckoutButtonClick(element, event) {
  if (event) event.preventDefault();

  const isCartValid = true; // Ajouter ici une logique de validation si nécessaire
  if (isCartValid) {
    const form = element.closest("form");
    if (form) form.submit();
  }
}

// ✅ Soumission du formulaire ATC avec feedback visuel
function handleAddToCartFormSubmit(form, event) {
  if (event) event.preventDefault();

  const btn = form.querySelector(".btn-atc");
  if (btn) {
    btn.innerHTML = `
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>`;
  }

  form.classList.add("loading");

  fetch("/cart/add.js", {
    method: "POST",
    body: new FormData(form),
    headers: {
      Accept: "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("✅ Produit ajouté au panier :", data);

      if (typeof updateCartDrawer === 'function') {
        updateCartDrawer();
      } else {
        window.location.reload();
      }

    })
    .catch(error => {
      console.error("❌ Erreur lors de l'ajout au panier :", error);
      form.classList.remove("loading");
    });
}