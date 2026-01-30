document.addEventListener("DOMContentLoaded", function () {
    const gradientOverlay = document.createElement("div");
    gradientOverlay.className = "page-gradient-overlay";
    document.body.appendChild(gradientOverlay);

    // Chargement des données JSON
    fetch("data.json")
        .then(function (response) {
            if (!response.ok) throw new Error("Erreur de chargement du fichier JSON");
            return response.json();
        })
        .then(function (data) {
            generateContent(data.heroes);
        })
        .catch(function (error) {
            console.error("Erreur:", error);
        });

    function generateContent(heroes) {
        const main = document.querySelector("main");
        let html = "";

        for (let i = 0; i < heroes.length; i++) {
            const hero = heroes[i];
            const isMirror = hero.position === "right";

            html += `
                <div class="hero-section" id="${hero.id}-hero" data-section="${hero.id}">
                    <h2>${hero.name}</h2>
                </div>
                <section class="content-section ${hero.id}" id="${hero.id}" data-section="${hero.id}">
                    <div class="content-layout ${isMirror ? "mirror" : ""}">
                        <div class="scenes-column ${isMirror ? "mirror" : ""}">
                            ${generateScenesHTML(hero.scenes)}
                        </div>
                        <div class="text-column ${isMirror ? "mirror" : ""}">
                            <div class="text-panel">
                                <h3>${hero.title}</h3>
                                ${generateParagraphs(hero.paragraphs)}
                            </div>
                            <div class="cutout-wrapper ${isMirror ? "cutout-left" : "cutout-right"}" data-image="${hero.cutoutImage}">
                                <img src="${hero.cutoutImage}" alt="${hero.cutoutAlt}" class="hero-cutout">
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        html += `
            <section class="contribute-section" id="contribute" data-section="contribute">
                <h2>Contribuer au site</h2>
                <p>Partagez votre passion Marvel en proposant une image et sa description !</p>
                <div class="contribute-card">
                    <div class="form-header">
                        <div class="form-header-title">Formulaire de contribution</div>
                        <div class="form-status-pill">Mode prévisualisation</div>
                    </div>
                    <form id="contribution-form">
                        <div class="form-group">
                            <label for="url">URL de l'image<span class="required">*</span></label>
                            <input type="url" id="url" name="url" placeholder="https://exemple.com/image.jpg" required>
                            <span class="help-text">Format : jpg, jpeg, png, gif, webp</span>
                            <span class="error-message" id="error-url"></span>
                        </div>
                        <div class="form-group">
                            <label for="title">Titre<span class="required">*</span></label>
                            <input type="text" id="title" name="title" placeholder="Titre de l'image" required maxlength="100">
                            <span class="help-text">Maximum 100 caractères.</span>
                            <span class="error-message" id="error-title"></span>
                        </div>
                        <div class="form-group full-width">
                            <label for="description">Paragraphe de présentation<span class="required">*</span></label>
                            <textarea id="description" name="description" placeholder="Décrivez l'image..." required maxlength="500"></textarea>
                            <span class="help-text">Maximum 500 caractères.</span>
                            <span class="error-message" id="error-description"></span>
                        </div>
                        <div class="form-group full-width">
                            <label for="source">Source / Propriété intellectuelle<span class="required">*</span></label>
                            <input type="text" id="source" name="source" placeholder="Marvel Studios - URL source" required>
                            <span class="help-text">Indiquez la source et les droits d'auteur.</span>
                            <span class="error-message" id="error-source"></span>
                        </div>
                        <button type="submit" class="submit-btn">Prévisualiser</button>
                    </form>
                    <div class="preview-zone" id="preview-zone">
                        <h3>Prévisualisation de votre contribution</h3>
                        <div id="preview-content"></div>
                    </div>
                    <div class="success-message" id="success-message">
                        <p>Votre contribution a été prévisualisée avec succès !</p>
                    </div>
                </div>
            </section>
        `;

        main.innerHTML = html;

        applyHeroBackgrounds(heroes);
        initZoom();
        initForm();
        initSmoothScroll();
        initLegalModal();
    }

    function generateScenesHTML(scenes) {
        let html = "";
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            html += `
                <div class="scene-item" 
                     data-image="${scene.image}" 
                     data-description="${scene.description || ''}"
                     role="button"
                     tabindex="0"
                     aria-label="${scene.alt}. Cliquez pour agrandir et voir plus de détails.">
                    <img src="${scene.image}" alt="${scene.alt}">
                    <span class="scene-credit">${scene.credit}</span>
                </div>
            `;
        }
        return html;
    }

    function generateParagraphs(paragraphs) {
        let html = "";
        for (let i = 0; i < paragraphs.length; i++) {
            html += `<p>${paragraphs[i]}</p>`;
        }
        return html;
    }

    function applyHeroBackgrounds(heroes) {
        heroes.forEach(function (hero) {
            const section = document.getElementById(hero.id + "-hero");
            if (section) {
                section.style.backgroundImage = `url("${hero.heroImage}")`;
            }
        });
    }

    function initZoom() {
        const zoomModal = document.getElementById("zoom-modal");
        const zoomImg = document.getElementById("zoom-image");
        const closeZoomBtn = document.getElementById("close-zoom");

        if (!zoomModal || !zoomImg) return;

        function openZoom(src, alt, description) {
            zoomImg.src = src;
            zoomImg.alt = alt || "Image Marvel";
            
            let descContainer = document.getElementById("zoom-description-container");
            if (!descContainer) {
                descContainer = document.createElement("div");
                descContainer.id = "zoom-description-container";
                descContainer.className = "zoom-description";
                zoomModal.querySelector(".modal-content").appendChild(descContainer);
            }
            
            if (description) {
                descContainer.innerHTML = `<p>${description}</p>`;
                descContainer.style.display = "block";
            } else {
                descContainer.style.display = "none";
            }
            
            zoomModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeZoom() {
            zoomModal.classList.remove("active");
            document.body.style.overflow = "";
            zoomImg.src = "";
            const descContainer = document.getElementById("zoom-description-container");
            if (descContainer) descContainer.style.display = "none";
        }

        document.querySelectorAll(".hero-section").forEach(function (heroSection) {
            heroSection.addEventListener("click", function (e) {
                if (e.target.tagName === "H2") return;
                const src = heroSection.style.backgroundImage.slice(5, -2);
                const alt = heroSection.querySelector("h2").textContent;
                if (src) openZoom(src, "Image de fond - " + alt);
            });
        });

        document.querySelectorAll(".scene-item").forEach(function (item) {
            item.addEventListener("click", function () {
                const src = item.getAttribute("data-image");
                const description = item.getAttribute("data-description");
                const img = item.querySelector("img");
                const alt = img ? img.alt : "";
                if (src) openZoom(src, alt, description);
            });
        });

        document.querySelectorAll(".cutout-wrapper").forEach(function (wrap) {
            wrap.addEventListener("click", function (e) {
                e.stopPropagation();
                const src = wrap.getAttribute("data-image");
                const img = wrap.querySelector("img");
                const alt = img ? img.alt : "";
                if (src) openZoom(src, alt);
            });
        });

        if (closeZoomBtn) closeZoomBtn.addEventListener("click", closeZoom);
        zoomModal.addEventListener("click", function (e) {
            if (e.target === zoomModal) closeZoom();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && zoomModal.classList.contains("active")) closeZoom();
        });
    }

    function initForm() {
        const form = document.getElementById("contribution-form");
        if (!form) return;

        const urlInput = document.getElementById("url");
        const titleInput = document.getElementById("title");
        const descInput = document.getElementById("description");
        const sourceInput = document.getElementById("source");
        const errUrl = document.getElementById("error-url");
        const errTitle = document.getElementById("error-title");
        const errDesc = document.getElementById("error-description");
        const errSource = document.getElementById("error-source");
        const previewZone = document.getElementById("preview-zone");
        const previewContent = document.getElementById("preview-content");
        const successMessage = document.getElementById("success-message");

        function validateURL(url) {
            if (!/^https?:\/\//i.test(url)) return false;
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        }

        function showError(input, span, msg) {
            input.classList.add("error");
            span.textContent = msg;
        }

        function clearError(input, span) {
            input.classList.remove("error");
            span.textContent = "";
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            clearError(urlInput, errUrl);
            clearError(titleInput, errTitle);
            clearError(descInput, errDesc);
            clearError(sourceInput, errSource);

            let hasError = false;
            const url = urlInput.value.trim();
            const title = titleInput.value.trim();
            const desc = descInput.value.trim();
            const source = sourceInput.value.trim();

            if (!url || !validateURL(url)) {
                showError(urlInput, errUrl, "Entrez une URL d'image valide (http(s) + jpg/png/gif/webp).");
                hasError = true;
            }
            if (!title) {
                showError(titleInput, errTitle, "Le titre est obligatoire.");
                hasError = true;
            }
            if (!desc) {
                showError(descInput, errDesc, "La description est obligatoire.");
                hasError = true;
            }
            if (!source) {
                showError(sourceInput, errSource, "La source est obligatoire.");
                hasError = true;
            }

            if (hasError) {
                previewZone.classList.remove("active");
                successMessage.style.display = "none";
                return;
            }

            previewContent.innerHTML = `
                <div style="text-align:center;">
                    <img src="${url}" alt="${title}" style="max-width:100%; border-radius:12px; margin:20px 0; box-shadow:0 10px 30px rgba(0,0,0,0.6);">
                    <h4 style="color:#fff; font-size:1.6em; margin:10px 0 15px; text-transform:uppercase; letter-spacing:2px;">${title}</h4>
                    <p style="color:#ccc; line-height:1.8; margin:10px 0 18px; font-size:1.02em;">${desc}</p>
                    <div style="margin-top:10px; padding:8px 18px; background:rgba(0,0,0,0.5); border-radius:999px; display:inline-block;">
                        <p style="color:#888; font-size:0.85em; margin:0;">Source : ${source}</p>
                    </div>
                </div>
            `;

            previewZone.classList.add("active");
            successMessage.style.display = "block";

            const rect = previewZone.getBoundingClientRect();
            window.scrollTo({
                top: window.scrollY + rect.top - 100,
                behavior: "smooth"
            });
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll("nav a[href^='#']").forEach(function (link) {
            link.addEventListener("click", function (e) {
                const targetId = link.getAttribute("href").substring(1);
                const target = document.getElementById(targetId);
                if (!target) return;

                e.preventDefault();
                const rect = target.getBoundingClientRect();
                window.scrollTo({
                    top: window.scrollY + rect.top - 120,
                    behavior: "smooth"
                });
            });
        });
    }

    function initLegalModal() {
        const legalModal = document.getElementById("legal-modal");
        const openLinks = [
            document.getElementById("legal-link"),
            document.getElementById("legal-link-footer")
        ];
        const closeBtn = document.getElementById("close-legal");

        if (!legalModal) return;

        openLinks.forEach(function (link) {
            if (!link) return;
            link.addEventListener("click", function (e) {
                e.preventDefault();
                legalModal.classList.add("active");
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                legalModal.classList.remove("active");
            });
        }

        legalModal.addEventListener("click", function (e) {
            if (e.target === legalModal) legalModal.classList.remove("active");
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && legalModal.classList.contains("active")) {
                legalModal.classList.remove("active");
            }
        });
    }
});