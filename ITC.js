const adminLoginModal = document.querySelector("#adminLoginModal");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminLoginMessage = document.querySelector("#adminLoginMessage");
const adminToolbar = document.querySelector("#adminToolbar");
const adminSidebarToggle = document.querySelector("#adminSidebarToggle");
const adminSidebarBackdrop = document.querySelector("#adminSidebarBackdrop");
const adminSidebarMobileQuery = window.matchMedia("(max-width: 760px)");
function setAdminSidebarOpen(isOpen) {
    const shouldOpen = Boolean(isOpen && isAdmin && adminSidebarMobileQuery.matches);
    document.body.classList.toggle("admin-sidebar-open", shouldOpen);
    if (adminSidebarToggle) {
        adminSidebarToggle.hidden = !isAdmin || !adminSidebarMobileQuery.matches;
        adminSidebarToggle.setAttribute("aria-expanded", String(shouldOpen));
        adminSidebarToggle.setAttribute("aria-label", shouldOpen ? "Tutup menu pengelola" : "Buka menu pengelola");
        adminSidebarToggle.innerHTML = `<i class="fa-solid fa-${shouldOpen ? "xmark" : "bars"}" aria-hidden="true"></i>`;
    }
    if (adminSidebarBackdrop) adminSidebarBackdrop.hidden = !shouldOpen;
}
adminSidebarToggle?.addEventListener("click", () => {
    setAdminSidebarOpen(!document.body.classList.contains("admin-sidebar-open"));
});
adminSidebarBackdrop?.addEventListener("click", () => setAdminSidebarOpen(false));
adminSidebarMobileQuery.addEventListener("change", event => {
    if (!event.matches) document.body.classList.remove("admin-sidebar-open");
    setAdminSidebarOpen(false);
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("admin-sidebar-open")) {
        setAdminSidebarOpen(false);
        adminSidebarToggle?.focus();
    }
});
const pageContentEditorPanel = document.querySelector("#pageContentEditorPanel");
const pageContentEditorFields = document.querySelector("#pageContentEditorFields");
const pageContentEditorStatus = document.querySelector("#pageContentEditorStatus");
const pageContentSymbolBar = document.querySelector("#pageContentSymbolBar");
let activePageContentTextarea = null;

pageContentEditorFields?.addEventListener("focusin", event => {
    if (event.target instanceof HTMLTextAreaElement && event.target.hasAttribute("data-page-content-key")) {
        activePageContentTextarea = event.target;
    }
});

pageContentSymbolBar?.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target.closest("[data-page-symbol]") : null;
    if (!target) return;
    if (!activePageContentTextarea?.isConnected) {
        if (pageContentEditorStatus) pageContentEditorStatus.textContent = "Pilih kolom teks terlebih dahulu.";
        return;
    }

    const textarea = activePageContentTextarea;
    const symbol = target.dataset.pageSymbol || "";
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? start;
    if (textarea.value.length - (end - start) + symbol.length > textarea.maxLength) {
        if (pageContentEditorStatus) pageContentEditorStatus.textContent = "Teks sudah mencapai batas 5.000 karakter.";
        return;
    }
    textarea.setRangeText(symbol, start, end, "end");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
});
const programSearchBox = document.querySelector(".nav-wrap > .search-box");
const publicSearchParent = programSearchBox?.parentElement;
const publicSearchNextSibling = programSearchBox?.nextSibling;
const adminSearchSlot = document.querySelector("#adminSearchSlot");

function setAdminSearchPlacement(isAuthenticated) {
    if (!programSearchBox || !publicSearchParent) return;
    if (isAuthenticated && adminSearchSlot) {
        adminSearchSlot.append(programSearchBox);
    } else {
        publicSearchParent.insertBefore(programSearchBox, publicSearchNextSibling?.parentNode === publicSearchParent ? publicSearchNextSibling : null);
    }
}

const adminContentWorkspaceLinks = {
    openProgramWorkspaceBtn: "program",
    openGalleryWorkspaceBtn: "galeri",
    openMembersWorkspaceBtn: "anggota",
    openAlumniWorkspaceBtn: "alumni"
};

function openAdminContentWorkspaceView(sectionId, menuLinkId) {
    if (!isAdmin) return;
    closeRegistrationWindowView();
    closeRegistrationsWorkspaceView();
    closeAdminAccountsWorkspaceView();
    closePageContentEditorView();
    closeHomeBackgroundWorkspaceView();
    closeSystemStatusWorkspaceView();
    closeAdminContentWorkspaceView();
    document.body.classList.add(`admin-content-workspace-${sectionId}-open`);
    document.querySelectorAll(".admin-sidebar-link").forEach(link => {
        link.classList.toggle("active", link.id === menuLinkId);
    });
}

function closeAdminContentWorkspaceView() {
    Object.values(adminContentWorkspaceLinks).forEach(sectionId => {
        document.body.classList.remove(`admin-content-workspace-${sectionId}-open`);
    });
    Object.keys(adminContentWorkspaceLinks).forEach(linkId => {
        document.querySelector(`#${linkId}`)?.classList.remove("active");
    });
}

adminToolbar?.querySelectorAll(".admin-sidebar-link[href]").forEach(link => {
    link.addEventListener("click", event => {
        adminToolbar.querySelectorAll(".admin-sidebar-link[href]").forEach(item => item.classList.toggle("active", item === link));
        if (adminContentWorkspaceLinks[link.id] && isAdmin) {
            event.preventDefault();
            openAdminContentWorkspaceView(adminContentWorkspaceLinks[link.id], link.id);
        } else {
            closeAdminContentWorkspaceView();
        }
    });
});
adminToolbar?.addEventListener("click", event => {
    const menuItem = event.target.closest(".admin-sidebar-link");
    if (menuItem) {
        setAdminSidebarOpen(false);
        if (!adminContentWorkspaceLinks[menuItem.id]) closeAdminContentWorkspaceView();
    }
    if (menuItem && !["manageRegistrationWindowBtn", "openRegistrationsWorkspaceBtn", "manageAdminAccountsBtn", "editPageContentBtn", "manageHomeBackgroundBtn", "manageSystemStatusBtn"].includes(menuItem.id)) {
        closeRegistrationWindowView();
        closeRegistrationsWorkspaceView();
        closeAdminAccountsWorkspaceView();
        closePageContentEditorView();
        closeHomeBackgroundWorkspaceView();
        closeSystemStatusWorkspaceView();
    }
});
document.querySelectorAll("#closeProgramWorkspaceBtn, #closeGalleryWorkspaceBtn, #closeMembersWorkspaceBtn, #closeAlumniWorkspaceBtn")
    .forEach(button => button.addEventListener("click", closeAdminContentWorkspaceView));
document.addEventListener("keydown", event => {
    const activeWorkspace = Object.entries(adminContentWorkspaceLinks)
        .find(([, sectionId]) => document.body.classList.contains(`admin-content-workspace-${sectionId}-open`));
    if (event.key === "Escape" && activeWorkspace) {
        closeAdminContentWorkspaceView();
        document.querySelector(`#${activeWorkspace[0]}`)?.focus();
    }
});
document.addEventListener("itc-admin-mode-change", () => {
    if (!isAdmin) closeAdminContentWorkspaceView();
});

const adminStatusMessage = document.querySelector("#adminStatusMessage");

const adminLoginEndpoint = adminLoginForm.dataset.loginEndpoint;
const adminLogoutEndpoint = adminLoginForm.dataset.logoutEndpoint;
const adminCheckEndpoint = adminLoginForm.dataset.checkEndpoint;
const adminProfileEndpoint = adminLoginForm.dataset.profileEndpoint;

const homeHeroStats = document.querySelector(".home-hero-stats");
const homeBackgroundSlidesContainer = document.querySelector("#homeBackgroundSlides");
const homeBackgroundDots = document.querySelector(".hero-dots");
const homeBackgroundEndpoint = adminLoginForm?.dataset.homeBackgroundEndpoint?.trim();
const homeBackgroundAdminPanel = document.querySelector("#homeBackgroundAdminPanel");
const homeBackgroundAdminList = document.querySelector("#homeBackgroundAdminList");
const homeBackgroundAdminStatus = document.querySelector("#homeBackgroundAdminStatus");
const homeBackgroundUploadForm = document.querySelector("#homeBackgroundUploadForm");
const homeBackgroundFileInput = document.querySelector("#homeBackgroundFile");
const uploadHomeBackgroundButton = document.querySelector("#uploadHomeBackgroundBtn");
function closeHomeBackgroundWorkspaceView() {
    if (homeBackgroundAdminPanel) homeBackgroundAdminPanel.hidden = true;
    const button = document.querySelector("#manageHomeBackgroundBtn");
    button?.classList.remove("active");
    button?.setAttribute("aria-expanded", "false");
}
let backgroundSlides = [...(homeBackgroundSlidesContainer?.querySelectorAll(".home-background-slide") || [])];
let homeBackgroundItems = [];
let activeBackgroundIndex = 0;
let backgroundSlideTimer;

function activateHomeBackground(index) {
    if (!backgroundSlides.length) return;
    backgroundSlides[activeBackgroundIndex]?.classList.remove("active");
    activeBackgroundIndex = (index + backgroundSlides.length) % backgroundSlides.length;
    backgroundSlides[activeBackgroundIndex].classList.add("active");
    homeBackgroundDots?.querySelectorAll("[data-slide-index]").forEach((button, buttonIndex) => {
        const isActive = buttonIndex === activeBackgroundIndex;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-current", String(isActive));
    });
}

function buildHomeBackgroundSlides(items) {
    if (!homeBackgroundSlidesContainer || !homeBackgroundDots) return;
    const activeItems = items.filter(item => item.isActive);
    if (!activeItems.length) return;

    const previousUrl = backgroundSlides[activeBackgroundIndex]?.dataset.imageUrl;
    homeBackgroundSlidesContainer.replaceChildren(...activeItems.map((item, index) => {
        const slide = document.createElement("span");
        slide.className = "home-background-slide";
        slide.dataset.imageUrl = item.imageUrl;
        slide.style.backgroundImage = `linear-gradient(rgba(4, 20, 39, 0.78), rgba(4, 20, 39, 0.78)), url("${item.imageUrl}")`;
        return slide;
    }));

    backgroundSlides = [...homeBackgroundSlidesContainer.querySelectorAll(".home-background-slide")];
    const retainedIndex = activeItems.findIndex(item => item.imageUrl === previousUrl);
    activeBackgroundIndex = retainedIndex >= 0 ? retainedIndex : 0;
    backgroundSlides[activeBackgroundIndex].classList.add("active");

    homeBackgroundDots.replaceChildren(...activeItems.map((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.slideIndex = String(index);
        button.setAttribute("aria-label", `Tampilkan foto ${index + 1}`);
        button.setAttribute("aria-current", String(index === activeBackgroundIndex));
        if (index === activeBackgroundIndex) button.classList.add("active");
        return button;
    }));
}

function scheduleHomeBackgroundSlide() {
    window.clearTimeout(backgroundSlideTimer);
    if (backgroundSlides.length < 2) return;
    backgroundSlideTimer = window.setTimeout(() => {
        activateHomeBackground(activeBackgroundIndex + 1);
        scheduleHomeBackgroundSlide();
    }, 5000);
}

async function loadHomeBackgrounds() {
    if (!homeBackgroundEndpoint) return;
    try {
        const response = await fetch(homeBackgroundEndpoint, {
            headers: { Accept: "application/json" },
            credentials: "same-origin"
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        homeBackgroundItems = result.data;
        buildHomeBackgroundSlides(homeBackgroundItems);
        renderHomeBackgroundAdminList();
        scheduleHomeBackgroundSlide();
    } catch (error) {
        console.error("Foto latar Beranda gagal dimuat:", error);
        if (homeBackgroundAdminStatus) {
            homeBackgroundAdminStatus.textContent = `Foto latar gagal dimuat: ${error.message}`;
        }
    }
}

function renderHomeBackgroundAdminList() {
    if (!homeBackgroundAdminList) return;
    homeBackgroundAdminList.replaceChildren(...homeBackgroundItems.map(item => {
        const card = document.createElement("article");
        card.className = "home-background-admin-card";
        const preview = document.createElement("img");
        preview.src = item.imageUrl;
        preview.alt = "Pratinjau foto latar Beranda";
        preview.loading = "lazy";
        const details = document.createElement("div");
        details.className = "home-background-admin-card-details";
        const label = document.createElement("strong");
        label.textContent = item.fileName || `Foto latar ${item.id}`;
        const status = document.createElement("span");
        status.textContent = item.isActive ? "Aktif dalam rotasi" : "Tidak aktif";
        details.append(label, status);
        const actions = document.createElement("div");
        actions.className = "home-background-admin-card-actions";
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.dataset.backgroundAction = "toggle";
        toggle.dataset.backgroundId = item.id;
        toggle.dataset.active = item.isActive ? "1" : "0";
        toggle.textContent = item.isActive ? "Nonaktifkan" : "Aktifkan";
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "home-background-delete";
        remove.dataset.backgroundAction = "delete";
        remove.dataset.backgroundId = item.id;
        remove.textContent = "Hapus";
        actions.append(toggle, remove);
        card.append(preview, details, actions);
        return card;
    }));
}

function getHomeBackgroundEndpoint() {
    if (!homeBackgroundEndpoint) throw new Error("Endpoint foto latar Beranda belum diatur.");
    return homeBackgroundEndpoint;
}

async function postHomeBackgroundAction(formData) {
    if (!isSuperAdmin || !adminCsrfToken) throw new Error("Hanya super admin yang dapat mengubah foto latar.");
    const response = await fetch(getHomeBackgroundEndpoint(), {
        method: "POST",
        headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
        credentials: "same-origin",
        body: formData
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) {
        throw new Error(result.message || `Server memberikan respons ${response.status}.`);
    }
    return result;
}

homeBackgroundDots?.addEventListener("click", event => {
    const button = event.target.closest("[data-slide-index]");
    if (!button) return;
    const index = Number(button.dataset.slideIndex);
    if (Number.isInteger(index) && backgroundSlides[index]) {
        activateHomeBackground(index);
        scheduleHomeBackgroundSlide();
    }
});

document.querySelector("#manageHomeBackgroundBtn")?.addEventListener("click", () => {
    if (!isSuperAdmin || !homeBackgroundAdminPanel) return;
    closeRegistrationWindowView();
    closeRegistrationsWorkspaceView();
    closeAdminAccountsWorkspaceView();
    closePageContentEditorView();
    closeSystemStatusWorkspaceView();
    homeBackgroundAdminPanel.hidden = false;
    document.querySelectorAll(".admin-sidebar-link").forEach(link => link.classList.toggle("active", link.id === "manageHomeBackgroundBtn"));
    document.querySelector("#manageHomeBackgroundBtn")?.setAttribute("aria-expanded", "true");
    loadHomeBackgrounds();
});

document.querySelector("#closeHomeBackgroundAdmin")?.addEventListener("click", () => {
    closeHomeBackgroundWorkspaceView();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && homeBackgroundAdminPanel && !homeBackgroundAdminPanel.hidden) {
        closeHomeBackgroundWorkspaceView();
        document.querySelector("#manageHomeBackgroundBtn")?.focus();
    }
});

homeBackgroundUploadForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const photo = homeBackgroundFileInput.files[0];
    if (!photo) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size > 10 * 1024 * 1024) {
        homeBackgroundAdminStatus.textContent = "Pilih foto JPG, PNG, atau WebP dengan ukuran maksimal 10 MB.";
        return;
    }
    const formData = new FormData();
    formData.set("action", "upload");
    formData.set("photo", photo);
    uploadHomeBackgroundButton.disabled = true;
    homeBackgroundAdminStatus.textContent = "Mengunggah dan menyimpan foto latar...";
    try {
        const result = await postHomeBackgroundAction(formData);
        homeBackgroundUploadForm.reset();
        homeBackgroundAdminStatus.textContent = result.message;
        await loadHomeBackgrounds();
    } catch (error) {
        homeBackgroundAdminStatus.textContent = `Foto latar gagal disimpan: ${error.message}`;
    } finally {
        uploadHomeBackgroundButton.disabled = false;
    }
});

homeBackgroundAdminList?.addEventListener("click", async event => {
    const button = event.target.closest("[data-background-action]");
    if (!button || !isSuperAdmin) return;
    const action = button.dataset.backgroundAction;
    if (action === "delete" && !window.confirm("Hapus foto latar ini dari website?")) return;
    const formData = new FormData();
    formData.set("action", action);
    formData.set("id", button.dataset.backgroundId);
    if (action === "toggle") formData.set("is_active", button.dataset.active === "1" ? "0" : "1");
    homeBackgroundAdminStatus.textContent = action === "delete" ? "Menghapus foto..." : "Memperbarui status foto...";
    try {
        const result = await postHomeBackgroundAction(formData);
        homeBackgroundAdminStatus.textContent = result.message;
        await loadHomeBackgrounds();
    } catch (error) {
        homeBackgroundAdminStatus.textContent = `Perubahan gagal: ${error.message}`;
    }
});

document.addEventListener("itc-admin-mode-change", () => {
    if (isSuperAdmin) {
        loadHomeBackgrounds();
        if (!adminAccountsPanel?.hidden) loadAdminAccounts();
    } else {
        closeHomeBackgroundWorkspaceView();
        closeAdminAccountsWorkspaceView();
        closeSystemStatusWorkspaceView();
    }
});

loadHomeBackgrounds();

const adminAccountsPanel = document.querySelector("#adminAccountsPanel");
const adminAccountsList = document.querySelector("#adminAccountsList");
const adminAccountsStatus = document.querySelector("#adminAccountsStatus");
const createAdminForm = document.querySelector("#createAdminForm");
const createAdminButton = document.querySelector("#createAdminSubmit");
const createAdminRoleField = document.querySelector("#newAdminRoleField");
const createAdminRole = document.querySelector("#newAdminRole");
const editAdminForm = document.querySelector("#editAdminForm");
const editAdminId = document.querySelector("#editAdminId");
const editAdminName = document.querySelector("#editAdminName");
const editAdminEmail = document.querySelector("#editAdminEmail");
const editAdminPassword = document.querySelector("#editAdminPassword");
const editAdminRole = document.querySelector("#editAdminRole");
const adminAccountsEndpoint = adminLoginForm?.dataset.adminsEndpoint?.trim();
const systemStatusEndpoint = adminLoginForm?.dataset.systemStatusEndpoint?.trim();
const systemStatusPanel = document.querySelector("#systemStatusPanel");
const systemStatusMessage = document.querySelector("#systemStatusMessage");

function closeSystemStatusWorkspaceView() {
    if (systemStatusPanel) systemStatusPanel.hidden = true;
    const button = document.querySelector("#manageSystemStatusBtn");
    button?.classList.remove("active");
    button?.setAttribute("aria-expanded", "false");
}

function closeAdminAccountsWorkspaceView() {
    if (adminAccountsPanel) adminAccountsPanel.hidden = true;
    const button = document.querySelector("#manageAdminAccountsBtn");
    button?.classList.remove("active");
    button?.setAttribute("aria-expanded", "false");
}

function formatStorageSize(bytes) {
    if (!Number.isFinite(Number(bytes))) return "Tidak tersedia";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = Number(bytes);
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    return `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
}

async function loadSystemStatus() {
    if (!isSuperAdmin || !systemStatusEndpoint) return;
    systemStatusMessage.textContent = "Memeriksa status sistem...";
    for (const id of ["systemDatabaseStatus", "systemDatabaseVersion", "systemUploadUsed", "systemUploadFileCount", "systemStorageFree", "systemRecordTotal"]) {
        const element = document.querySelector(`#${id}`);
        if (element) element.textContent = "Memuat...";
    }
    try {
        const response = await fetch(systemStatusEndpoint, {
            headers: { Accept: "application/json" },
            credentials: "same-origin",
            cache: "no-store"
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !result.data) {
            throw new Error(result.message || "Status sistem belum dapat dimuat.");
        }
        const { database, storage, runtime, checked_at: checkedAt } = result.data;
        const databaseStatus = document.querySelector("#systemDatabaseStatus");
        const databaseDescription = document.querySelector("#systemDatabaseDescription");
        const databaseVersion = document.querySelector("#systemDatabaseVersion");
        const uploadUsed = document.querySelector("#systemUploadUsed");
        const uploadFileCount = document.querySelector("#systemUploadFileCount");
        const storageFree = document.querySelector("#systemStorageFree");
        const storageTotal = document.querySelector("#systemStorageTotal");
        const recordTotal = document.querySelector("#systemRecordTotal");
        const recordStats = document.querySelector("#systemRecordStats");
        const uploadBreakdown = document.querySelector("#systemUploadBreakdown");
        const runtimeInfo = document.querySelector("#systemRuntimeInfo");
        const storageDonut = document.querySelector("#systemStorageDonut");
        const storagePercent = document.querySelector("#systemStoragePercent");
        const storageUsedLegend = document.querySelector("#systemStorageUsedLegend");
        const storageFreeLegend = document.querySelector("#systemStorageFreeLegend");
        const recordChart = document.querySelector("#systemRecordChart");

        databaseStatus.textContent = database?.healthy ? "Sehat" : "Perlu diperiksa";
        databaseStatus.dataset.status = database?.healthy ? "ok" : "warning";
        databaseDescription.textContent = database?.healthy
            ? "Layanan data berfungsi normal"
            : "Layanan data sedang tidak tersedia";
        databaseVersion.textContent = database?.version ? `Server MySQL ${database.version}` : "Versi server tidak tersedia";
        uploadUsed.textContent = storage?.available ? formatStorageSize(storage.used_bytes) : "Tidak tersedia";
        uploadFileCount.textContent = `${Number(storage?.file_count || 0).toLocaleString("id-ID")} file tersimpan`;
        storageFree.textContent = storage?.available ? formatStorageSize(storage.free_bytes) : "Tidak tersedia";
        storageTotal.textContent = storage?.available
            ? `${storage.used_percent}% terpakai dari ${formatStorageSize(storage.total_bytes)}`
            : "Kapasitas penyimpanan belum dapat dibaca";
        recordTotal.textContent = Number(database?.total_records || 0).toLocaleString("id-ID");

        const diskPercent = storage?.available && Number.isFinite(Number(storage.used_percent))
            ? Math.min(100, Math.max(0, Number(storage.used_percent)))
            : null;
        storageDonut.style.setProperty("--chart-value", `${diskPercent ?? 0}%`);
        storageDonut.setAttribute("aria-label", diskPercent === null
            ? "Informasi kapasitas disk server belum tersedia"
            : `Disk server terpakai ${diskPercent}% dan tersedia ${100 - diskPercent}%`);
        storagePercent.textContent = diskPercent === null ? "—%" : `${diskPercent}%`;
        storageUsedLegend.textContent = storage?.available
            ? formatStorageSize(Number(storage.total_bytes) - Number(storage.free_bytes))
            : "Tidak tersedia";
        storageFreeLegend.textContent = storage?.available
            ? formatStorageSize(storage.free_bytes)
            : "Tidak tersedia";

        const availableTables = (Array.isArray(database?.tables) ? database.tables : [])
            .filter(table => table.available && Number.isFinite(Number(table.records)));
        const maxTableRecords = Math.max(1, ...availableTables.map(table => Number(table.records)));
        const recordChartRows = availableTables.map(table => {
            const count = Number(table.records);
            const ratio = Math.max(0, Math.min(100, (count / maxTableRecords) * 100));
            const row = document.createElement("div");
            row.className = "system-status-record-chart-row";
            row.setAttribute("role", "listitem");
            const label = document.createElement("span");
            label.className = "system-status-record-chart-label";
            label.textContent = table.label;
            const line = document.createElement("div");
            line.className = "system-status-record-chart-track";
            line.setAttribute("role", "img");
            line.setAttribute("aria-label", `${table.label}: ${count.toLocaleString("id-ID")} data`);
            const fill = document.createElement("span");
            fill.style.width = `${ratio}%`;
            line.append(fill);
            const value = document.createElement("strong");
            value.textContent = count.toLocaleString("id-ID");
            row.append(label, line, value);
            return row;
        });
        recordChart.replaceChildren(...recordChartRows);

        const recordRows = (Array.isArray(database?.tables) ? database.tables : []).map(table => {
            const row = document.createElement("tr");
            [table.label, table.available ? Number(table.records).toLocaleString("id-ID") : "—", table.available ? formatStorageSize(table.size_bytes) : "—", table.available ? "Tersedia" : "Tabel belum dibuat"].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.append(cell);
            });
            return row;
        });
        recordStats.replaceChildren(...recordRows);

        const folderRows = (Array.isArray(storage?.folders) ? storage.folders : []).map(folder => {
            const row = document.createElement("tr");
            [folder.label, folder.available ? Number(folder.files).toLocaleString("id-ID") : "—", folder.available ? formatStorageSize(folder.bytes) : "—", folder.available ? "Tersedia" : "Folder belum dibuat"].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.append(cell);
            });
            return row;
        });
        uploadBreakdown.replaceChildren(...folderRows);
        runtimeInfo.textContent = `PHP ${runtime?.php_version || "—"} · Zona waktu ${runtime?.timezone || "—"}`;
        systemStatusMessage.textContent = `Diperiksa ${new Date(checkedAt).toLocaleString("id-ID")}.`;
    } catch (_) {
        systemStatusMessage.textContent = "Status sistem belum dapat dimuat. Silakan coba lagi.";
        for (const id of ["systemDatabaseStatus", "systemDatabaseVersion", "systemUploadUsed", "systemUploadFileCount", "systemStorageFree", "systemRecordTotal"]) {
            const element = document.querySelector(`#${id}`);
            if (element) element.textContent = "Belum tersedia";
        }
        document.querySelector("#systemRecordStats")?.replaceChildren();
        document.querySelector("#systemUploadBreakdown")?.replaceChildren();
        document.querySelector("#systemRuntimeInfo")?.replaceChildren();
        document.querySelector("#systemStoragePercent")?.replaceChildren(document.createTextNode("—%"));
        const usedLegend = document.querySelector("#systemStorageUsedLegend");
        const freeLegend = document.querySelector("#systemStorageFreeLegend");
        if (usedLegend) usedLegend.textContent = "Tidak tersedia";
        if (freeLegend) freeLegend.textContent = "Tidak tersedia";
        document.querySelector("#systemStorageDonut")?.style.setProperty("--chart-value", "0%");
        document.querySelector("#systemRecordChart")?.replaceChildren();
    }
}

async function loadAdminAccounts() {
    if (!isSuperAdmin || !adminAccountsEndpoint) return;
    adminAccountsStatus.textContent = "Memuat akun pengelola...";
    try {
        const response = await fetch(adminAccountsEndpoint, {
            headers: { Accept: "application/json" },
            credentials: "same-origin",
            cache: "no-store"
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        adminAccountsList.replaceChildren(...result.data.map(admin => {
            const item = document.createElement("article");
            item.className = "admin-account-item";
            const name = document.createElement("strong");
            name.textContent = admin.name;
            const email = document.createElement("span");
            email.textContent = admin.email;
            const role = document.createElement("small");
            role.textContent = admin.role === "super_admin" ? "Super admin" : "Admin";
            const status = document.createElement("small");
            status.className = admin.is_active ? "admin-account-active" : "admin-account-inactive";
            status.textContent = admin.is_active ? "Aktif" : "Nonaktif";
            const created = document.createElement("small");
            created.textContent = `Terdaftar: ${new Date(admin.created_at.replace(" ", "T")).toLocaleString("id-ID")}`;
            item.dataset.adminId = admin.id;
            item.dataset.adminRole = admin.role;
            item.dataset.primary = String(admin.isPrimary === true);
            item.dataset.active = String(admin.is_active);
            item.append(name, email, role, status, created);
            const edit = document.createElement("button");
            edit.type = "button";
            edit.className = "admin-account-edit";
            edit.dataset.editAdminId = admin.id;
            edit.textContent = "Edit akun";
            item.append(edit);

            if (admin.isPrimary !== true && String(admin.id) !== currentAdminId) {
                const toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = admin.is_active ? "admin-account-deactivate" : "admin-account-activate";
                toggle.dataset.toggleAdminId = admin.id;
                toggle.dataset.nextActive = admin.is_active ? "0" : "1";
                toggle.textContent = admin.is_active ? "Nonaktifkan" : "Aktifkan";
                item.append(toggle);
            }
            if (String(admin.id) !== currentAdminId && admin.isPrimary !== true &&
                (admin.role === "admin" || (isPrimarySuperAdmin && admin.role === "super_admin"))) {
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "admin-account-delete";
                remove.dataset.deleteAdminId = admin.id;
                remove.textContent = "Hapus akun";
                item.append(remove);
            }
            return item;
        }));
        adminAccountsStatus.textContent = `${result.data.length} akun pengelola.`;
    } catch (error) {
        adminAccountsStatus.textContent = `Akun pengelola gagal dimuat: ${error.message}`;
    }
}

adminAccountsList?.addEventListener("click", async event => {
    const deleteButton = event.target.closest("[data-delete-admin-id]");
    if (deleteButton) {
        if (!isSuperAdmin || !adminCsrfToken) return;
        const item = deleteButton.closest(".admin-account-item");
        const email = item?.querySelector("span")?.textContent || "akun ini";
        const role = item?.dataset.adminRole;
        const isDeletingSuperAdmin = role === "super_admin";
        const confirmation = isDeletingSuperAdmin
            ? `Hapus permanen akun super admin ${email}? Akun tersebut tidak dapat login lagi.`
            : `Hapus permanen akun admin ${email}? Akun tersebut tidak dapat login lagi.`;
        if (!window.confirm(confirmation)) return;

        const formData = new FormData();
        formData.set("action", "delete");
        formData.set("id", deleteButton.dataset.deleteAdminId);
        deleteButton.disabled = true;
        adminAccountsStatus.textContent = `Menghapus akun ${email}...`;
        try {
            const response = await fetch(adminAccountsEndpoint, {
                method: "POST",
                headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
                credentials: "same-origin",
                body: formData
            });
            const result = await response.json();
            if (!response.ok || result.success !== true) {
                throw new Error(result.message || `Server memberikan respons ${response.status}.`);
            }
            adminAccountsStatus.textContent = result.message;
            editAdminForm.hidden = true;
            await loadAdminAccounts();
        } catch (error) {
            adminAccountsStatus.textContent = `Akun gagal dihapus: ${error.message}`;
            deleteButton.disabled = false;
        }
        return;
    }

    const editButton = event.target.closest("[data-edit-admin-id]");
    if (editButton) {
        const item = editButton.closest(".admin-account-item");
        if (!item || !isSuperAdmin) return;
        editAdminId.value = item.dataset.adminId;
        editAdminName.value = item.querySelector("strong")?.textContent || "";
        editAdminEmail.value = item.querySelector("span")?.textContent || "";
        editAdminPassword.value = "";
        editAdminRole.value = item.dataset.adminRole;
        editAdminForm.dataset.originalRole = item.dataset.adminRole;
        editAdminRole.disabled = item.dataset.primary === "true" || item.dataset.adminId === currentAdminId;
        editAdminForm.hidden = false;
        editAdminForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
    }

    const button = event.target.closest("[data-toggle-admin-id]");
    if (!button || !isSuperAdmin) return;
    const account = button.closest(".admin-account-item");
    const email = account?.querySelector("span")?.textContent || "akun ini";
    const willActivate = button.dataset.nextActive === "1";
    if (!window.confirm(`${willActivate ? "Aktifkan" : "Nonaktifkan"} ${email}? ${willActivate ? "Akun dapat login kembali." : "Akses login dicabut, tetapi data akun tetap tersimpan."}`)) return;

    const formData = new FormData();
    formData.set("action", "status");
    formData.set("id", button.dataset.toggleAdminId);
    formData.set("is_active", button.dataset.nextActive);
    button.disabled = true;
    adminAccountsStatus.textContent = `${willActivate ? "Mengaktifkan" : "Menonaktifkan"} ${email}...`;
    try {
        const response = await fetch(adminAccountsEndpoint, {
            method: "POST",
            headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
            credentials: "same-origin",
            body: formData
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        adminAccountsStatus.textContent = result.message;
        await loadAdminAccounts();
    } catch (error) {
        adminAccountsStatus.textContent = `Status akun gagal diperbarui: ${error.message}`;
        button.disabled = false;
    }
});

editAdminForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!isSuperAdmin || !adminCsrfToken || !editAdminForm.reportValidity()) return;
    if (editAdminRole.value !== editAdminForm.dataset.originalRole &&
        !window.confirm(`Ubah role akun ini dari ${editAdminForm.dataset.originalRole} menjadi ${editAdminRole.value}?`)) return;
    const formData = new FormData(editAdminForm);
    formData.set("action", "edit");
    formData.set("role", editAdminRole.value);
    const saveButton = document.querySelector("#saveAdminEditBtn");
    saveButton.disabled = true;
    adminAccountsStatus.textContent = "Menyimpan perubahan akun...";
    try {
        const response = await fetch(adminAccountsEndpoint, {
            method: "POST",
            headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
            credentials: "same-origin",
            body: formData
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        if (String(result.data.id) === currentAdminId) {
            const label = document.querySelector("#adminLoginOpen span");
            if (label) label.textContent = `Super Admin: ${result.data.name}`;
            updateAdminSidebarProfile(result.data);
        }
        editAdminForm.reset();
        editAdminRole.disabled = false;
        editAdminForm.hidden = true;
        adminAccountsStatus.textContent = result.message;
        await loadAdminAccounts();
    } catch (error) {
        adminAccountsStatus.textContent = `Perubahan akun gagal disimpan: ${error.message}`;
    } finally {
        saveButton.disabled = false;
    }
});

document.querySelector("#cancelAdminEditBtn")?.addEventListener("click", () => {
    editAdminForm.reset();
    editAdminRole.disabled = false;
    editAdminForm.hidden = true;
});

document.querySelector("#manageAdminAccountsBtn")?.addEventListener("click", () => {
    if (!isSuperAdmin || !adminAccountsPanel) return;
    closeRegistrationWindowView();
    closeRegistrationsWorkspaceView();
    closePageContentEditorView();
    closeHomeBackgroundWorkspaceView();
    closeSystemStatusWorkspaceView();
    adminAccountsPanel.hidden = false;
    document.querySelectorAll(".admin-sidebar-link").forEach(link => link.classList.toggle("active", link.id === "manageAdminAccountsBtn"));
    document.querySelector("#manageAdminAccountsBtn")?.setAttribute("aria-expanded", "true");
    loadAdminAccounts();
});

document.querySelector("#closeAdminAccounts")?.addEventListener("click", () => {
    closeAdminAccountsWorkspaceView();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && adminAccountsPanel && !adminAccountsPanel.hidden) {
        closeAdminAccountsWorkspaceView();
        document.querySelector("#manageAdminAccountsBtn")?.focus();
    }
});

document.querySelector("#manageSystemStatusBtn")?.addEventListener("click", () => {
    if (!isSuperAdmin || !systemStatusPanel) return;
    closeRegistrationWindowView();
    closeRegistrationsWorkspaceView();
    closeAdminAccountsWorkspaceView();
    closePageContentEditorView();
    closeHomeBackgroundWorkspaceView();
    systemStatusPanel.hidden = false;
    document.querySelectorAll(".admin-sidebar-link").forEach(link => link.classList.toggle("active", link.id === "manageSystemStatusBtn"));
    document.querySelector("#manageSystemStatusBtn")?.setAttribute("aria-expanded", "true");
    loadSystemStatus();
});

document.querySelector("#refreshSystemStatusBtn")?.addEventListener("click", loadSystemStatus);
document.querySelector("#closeSystemStatusBtn")?.addEventListener("click", closeSystemStatusWorkspaceView);
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && systemStatusPanel && !systemStatusPanel.hidden) {
        closeSystemStatusWorkspaceView();
        document.querySelector("#manageSystemStatusBtn")?.focus();
    }
});

createAdminRole?.addEventListener("change", () => {
    createAdminButton.textContent = createAdminRole.value === "super_admin"
        ? "Buat akun super admin"
        : "Buat akun admin";
});

createAdminForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!isSuperAdmin || !adminCsrfToken) {
        adminAccountsStatus.textContent = "Hanya super admin yang dapat membuat akun admin.";
        return;
    }
    const formData = new FormData(createAdminForm);
    formData.set("action", "create");
    if (!isPrimarySuperAdmin) formData.set("role", "admin");
    createAdminButton.disabled = true;
    adminAccountsStatus.textContent = formData.get("role") === "super_admin"
        ? "Membuat akun super admin..."
        : "Membuat akun admin...";
    try {
        const response = await fetch(adminAccountsEndpoint, {
            method: "POST",
            headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
            credentials: "same-origin",
            body: formData
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        createAdminForm.reset();
        createAdminButton.textContent = "Buat akun admin";
        adminAccountsStatus.textContent = result.message;
        await loadAdminAccounts();
    } catch (error) {
        adminAccountsStatus.textContent = `Akun admin gagal dibuat: ${error.message}`;
    } finally {
        createAdminButton.disabled = false;
    }
});

function getMembersEndpoint() {
    const endpoint = adminLoginForm?.dataset.membersEndpoint?.trim();
    if (!endpoint) {
        throw new Error("Endpoint data anggota belum diatur pada formulir admin.");
    }
    return endpoint;
}

function getAlumniEndpoint() {
    const endpoint = adminLoginForm?.dataset.alumniEndpoint?.trim();
    if (!endpoint) {
        throw new Error("Endpoint data alumni belum diatur pada formulir admin.");
    }
    return endpoint;
}

let isAdmin = false;
let isSuperAdmin = false;
let isPrimarySuperAdmin = false;
let currentAdminId = "";
let adminCsrfToken = "";
let isEditingPageContent = false;
let editablePageTexts = [];
let pageContentSnapshot = {};
let isProgramCountManuallySet = false;

function updateAdminSidebarProfile(admin = {}) {
    const name = admin.name || document.querySelector("#adminProfileName")?.textContent || "Administrator";
    const nameNode = document.querySelector("#adminProfileName");
    const roleNode = document.querySelector("#adminProfileRole");
    const roleLabel = document.querySelector("#adminRoleLabel");
    const emailNode = document.querySelector("#adminProfileEmail");
    const avatar = document.querySelector("#adminAvatar");
    const fallback = document.querySelector("#adminAvatarFallback");
    if (nameNode) nameNode.textContent = name;
    if (admin.role) {
        const roleName = admin.role === "super_admin" ? "Super Admin" : "Admin";
        if (roleNode) roleNode.textContent = roleName;
        if (roleLabel) roleLabel.textContent = `Login sebagai ${roleName}`;
    }
    if (emailNode && admin.email) emailNode.textContent = admin.email;
    if (avatar && Object.prototype.hasOwnProperty.call(admin, "profilePhoto")) {
        avatar.querySelector("img")?.remove();
        if (admin.profilePhoto) {
            const image = document.createElement("img");
            image.src = admin.profilePhoto;
            image.alt = "";
            avatar.insertBefore(image, avatar.firstChild);
            if (fallback) fallback.hidden = true;
        } else if (fallback) {
            fallback.hidden = false;
            fallback.textContent = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "IT";
        }
    }
}

function getSiteContentEndpoint() {
    const endpoint = adminLoginForm?.dataset.siteContentEndpoint?.trim();
    if (!endpoint) {
        throw new Error("Endpoint konten halaman belum diatur.");
    }
    return endpoint;
}


// Memeriksa sesi administrator yang tersimpan di server.
// Fungsi ini dipanggil sekali di bagian paling bawah file.
async function checkAdminSession() {
    if (!adminCheckEndpoint) {
        console.error("Endpoint pemeriksaan sesi admin belum diatur.");
        return;
    }

    try {
        const response = await fetch(adminCheckEndpoint, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "same-origin"
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
            throw new Error(
                result.message || `Pemeriksaan sesi gagal (${response.status}).`
            );
        }

        const admin = result.data || {};

        if (admin.authenticated === true) {
            updateAdminSidebarProfile(admin);
            isAdmin = true;
            setAdminSearchPlacement(true);
            setNavigationOpen(false);
            isSuperAdmin = admin.role === "super_admin";
            isPrimarySuperAdmin = isSuperAdmin && String(admin.id) === "2";
            currentAdminId = String(admin.id || "");
            if (createAdminRoleField) createAdminRoleField.hidden = !isPrimarySuperAdmin;
            adminCsrfToken = admin.csrfToken || "";

            document.body.classList.add("admin-mode");
            document.body.classList.toggle("super-admin-mode", isSuperAdmin);

            if (adminToolbar) {
                adminToolbar.hidden = false;
            }
            setAdminSidebarOpen(false);

            const loginButtonLabel = document.querySelector(
                "#adminLoginOpen span"
            );

            if (loginButtonLabel) {
                loginButtonLabel.textContent = admin.name
                    ? `${isSuperAdmin ? "Super Admin" : "Admin"}: ${admin.name}`
                    : (isSuperAdmin ? "Super Admin aktif" : "Admin aktif");
            }

            showAdminMessage(
                admin.name
                    ? `Anda masuk sebagai ${admin.name}.`
                    : "Sesi administrator masih aktif."
            );

            if (typeof renderMembers === "function") {
                renderMembers();
            }

            document.dispatchEvent(
                new CustomEvent("itc-admin-mode-change")
            );
        } else {
            isAdmin = false;
            setAdminSearchPlacement(false);
            isSuperAdmin = false;
            isPrimarySuperAdmin = false;
            currentAdminId = "";
            if (createAdminRoleField) createAdminRoleField.hidden = true;
            adminCsrfToken = "";

            document.body.classList.remove("admin-mode");
            document.body.classList.remove("super-admin-mode");

            if (adminToolbar) {
                adminToolbar.hidden = true;
            }
            setAdminSidebarOpen(false);

            const loginButtonLabel = document.querySelector(
                "#adminLoginOpen span"
            );

            if (loginButtonLabel) {
                loginButtonLabel.textContent = "Login Admin";
            }
            if (isEditingPageContent) setPageContentEditing(false);
        }
    } catch (error) {
        console.error("Pemeriksaan sesi admin gagal:", error);
        showAdminMessage(
            `Status login admin tidak dapat diperiksa: ${error.message}`
        );
    }
}

function showAdminMessage(message) {
    if (adminStatusMessage) {
        adminStatusMessage.textContent = message;
    }
}

function collectEditablePageTexts() {
    const excludedContent = [
        ".date-time-widget",
        ".navbar",
        ".search-box",
        ".filters",
        ".program-management",
        ".gallery-management",
        ".member-management",
        ".alumni-management",
        ".program-grid",
        ".gallery-grid",
        ".member-grid",
        ".alumni-grid",
        ".program-form",
        ".gallery-form",
        ".member-form",
        ".alumni-form",
        ".registration-form",
        ".admin-toolbar",
        ".admin-only"
    ].join(",");
    const candidates = document.querySelectorAll("main *, footer *, .header *");

    const editable = [...candidates].filter(element =>
        ["H1", "H2", "H3", "P", "SPAN", "SMALL", "STRONG", "LI", "A", "B"].includes(element.tagName) &&
        element.children.length === 0 &&
        element.textContent.trim() &&
        !element.closest(excludedContent) &&
        !["year"].includes(element.id)
    );

    let legacyCopyIndex = 0;
    editable.forEach(element => {
        const stableKey = element.dataset.pageContentKey;
        if (
            stableKey === "program-count-value" ||
            stableKey === "profile-title-first" ||
            stableKey === "program-heading-first" ||
            stableKey === "gallery-heading-first" ||
            stableKey === "member-heading-first" ||
            stableKey === "registration-heading-first" ||
            /^registration-benefit-[1-3]$/.test(stableKey || "")
        ) {
            element.dataset.adminContentKey = stableKey;
            return;
        }

        element.dataset.adminContentKey = stableKey || `copy-${legacyCopyIndex}`;
        legacyCopyIndex += 1;
    });

    return editable;
}

async function loadPageContent() {
    editablePageTexts = collectEditablePageTexts();

    try {
        const response = await fetch(getSiteContentEndpoint(), {
            method: "GET",
            headers: { "Accept": "application/json" },
            credentials: "same-origin",
            cache: "no-store"
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !result.data || typeof result.data !== "object") {
            throw new Error(result.message || `Konten halaman gagal dimuat (${response.status}).`);
        }

        const content = result.data;
        isProgramCountManuallySet = Object.prototype.hasOwnProperty.call(
            content,
            "program-count-value"
        );
        editablePageTexts.forEach(element => {
            const value = content[element.dataset.adminContentKey];
            if (typeof value === "string") {
                element.textContent = value;
            }
        });
        pageContentSnapshot = Object.fromEntries(editablePageTexts.map(element => [
            element.dataset.adminContentKey,
            element.textContent
        ]));
    } catch (error) {
        showAdminMessage(`Konten halaman gagal dimuat: ${error.message}`);
    }
}

function renderPageContentEditor() {
    if (!pageContentEditorFields) return;
    activePageContentTextarea = null;
    const groups = new Map();
    editablePageTexts.forEach((element, index) => {
        const section = element.closest("section[id]");
        const heading = section?.querySelector("h1, h2, h3")?.textContent.trim();
        const groupName = heading || section?.id || (element.closest("footer") ? "Footer" : "Konten halaman");
        let group = groups.get(groupName);
        if (!group) {
            group = document.createElement("section");
            group.className = "page-content-editor-group";
            const title = document.createElement("h3");
            title.textContent = groupName;
            const fields = document.createElement("div");
            fields.className = "page-content-editor-group-fields";
            group.append(title, fields);
            groups.set(groupName, { section: group, fields });
        }

        const field = document.createElement("div");
        field.className = "page-content-editor-field";
        const label = document.createElement("label");
        const inputId = `pageContentText${index}`;
        label.htmlFor = inputId;
        label.textContent = `Teks ${index + 1}`;
        const textarea = document.createElement("textarea");
        textarea.id = inputId;
        textarea.rows = Math.min(7, Math.max(2, Math.ceil(element.textContent.length / 85)));
        textarea.maxLength = 5000;
        textarea.value = element.textContent;
        textarea.dataset.pageContentKey = element.dataset.adminContentKey;
        textarea.setAttribute("aria-label", `Edit Teks ${index + 1} pada ${groupName}`);
        field.append(label, textarea);
        groups.get(groupName).fields.append(field);
    });
    pageContentEditorFields.replaceChildren(...[...groups.values()].map(group => group.section));
    if (pageContentEditorStatus) pageContentEditorStatus.textContent = `${editablePageTexts.length} bagian teks tersedia untuk diedit.`;
}

function setPageContentEditing(enabled) {
    if (enabled && !isSuperAdmin) {
        showAdminMessage("Hanya super admin yang dapat mengedit teks halaman.");
        return;
    }
    if (enabled) {
        closeRegistrationWindowView();
        closeRegistrationsWorkspaceView();
        closeAdminAccountsWorkspaceView();
        closeHomeBackgroundWorkspaceView();
        closeSystemStatusWorkspaceView();
        pageContentSnapshot = Object.fromEntries(editablePageTexts.map(element => [
            element.dataset.adminContentKey,
            element.textContent
        ]));
        renderPageContentEditor();
        if (pageContentEditorPanel) pageContentEditorPanel.hidden = false;
        document.querySelector("#editPageContentBtn")?.classList.add("active");
        document.querySelector("#editPageContentBtn")?.setAttribute("aria-expanded", "true");
        isEditingPageContent = true;
        showAdminMessage("Mode edit teks halaman dibuka.");
        return;
    }

    isEditingPageContent = false;
    activePageContentTextarea = null;
    if (pageContentEditorPanel) pageContentEditorPanel.hidden = true;
    document.querySelector("#editPageContentBtn")?.classList.remove("active");
    document.querySelector("#editPageContentBtn")?.setAttribute("aria-expanded", "false");
    showAdminMessage("Editor teks halaman ditutup.");
}

function closePageContentEditorView() {
    if (isEditingPageContent) setPageContentEditing(false);
    else if (pageContentEditorPanel) pageContentEditorPanel.hidden = true;
}

loadPageContent();

document.querySelector("#adminLoginOpen").addEventListener("click", () => {
    adminLoginMessage.textContent = "";
    adminLoginForm.reset();
    adminLoginModal.classList.add("active");
    document.querySelector("#adminUsername").focus();
});

document.querySelector("#adminProfilePhotoInput")?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file || !isAdmin || !adminProfileEndpoint) return;
    const data = new FormData();
    data.set("photo", file);
    showAdminMessage("Mengunggah foto profil...");
    try {
        const response = await fetch(adminProfileEndpoint, {
            method: "POST",
            headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
            credentials: "same-origin",
            body: data
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) throw new Error(result.message || "Foto profil gagal diperbarui.");
        updateAdminSidebarProfile({ profilePhoto: result.data.profilePhoto });
        showAdminMessage(result.message);
    } catch (error) {
        showAdminMessage(`Foto profil gagal diperbarui: ${error.message}`);
    } finally {
        event.target.value = "";
    }
});

document.querySelector("#adminLoginClose").addEventListener("click", () => {
    adminLoginModal.classList.remove("active");
});

adminLoginModal.addEventListener("click", event => {
    if (event.target === adminLoginModal) {
        adminLoginModal.classList.remove("active");
    }
});

adminLoginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const username = document.querySelector("#adminUsername").value.trim();
    const password = document.querySelector("#adminPassword").value;
    const submitButton = adminLoginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    adminLoginMessage.textContent = "";

    try {
        const response = await fetch(adminLoginEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({ username, password })
        });

        if (response.status === 401) {
            adminLoginMessage.textContent = "Nama pengguna atau kata sandi tidak sesuai.";
            return;
        }
        if (response.status === 403) {
            const result = await response.json();
            adminLoginMessage.textContent = result.message || "Akun ini sedang dinonaktifkan.";
            return;
        }
        if (!response.ok) {
            throw new Error(`Server login memberikan respons ${response.status}.`);
        }

        const result = await response.json();

        if (!response.ok) {
            adminLoginMessage.textContent =
                result.message || "Email atau password salah.";
            return;
        }

        if (result.data?.authenticated !== true) {
            adminLoginMessage.textContent =
                result.message || "Server tidak mengonfirmasi login admin.";
             return;
        }

        adminCsrfToken = result.data.csrfToken || "";
        updateAdminSidebarProfile(result.data);
        isAdmin = true;
        setAdminSearchPlacement(true);
        setNavigationOpen(false);
        isSuperAdmin = result.data.role === "super_admin";
        isPrimarySuperAdmin = isSuperAdmin && String(result.data.id) === "2";
        currentAdminId = String(result.data.id || "");
        if (createAdminRoleField) createAdminRoleField.hidden = !isPrimarySuperAdmin;
        document.body.classList.add("admin-mode");
        document.body.classList.toggle("super-admin-mode", isSuperAdmin);
        adminToolbar.hidden = false;
        setAdminSidebarOpen(false);
        adminLoginModal.classList.remove("active");
        document.querySelector("#adminLoginOpen").querySelector("span").textContent =
            result.data.name ? `${isSuperAdmin ? "Super Admin" : "Admin"}: ${result.data.name}` : "Admin aktif";
        showAdminMessage(isSuperAdmin
            ? "Anda masuk sebagai super admin dan dapat mengelola seluruh isi website."
            : "Anda masuk sebagai admin. Anda dapat melihat pendaftar serta mengelola program kerja dan galeri.");
        adminLoginForm.reset();
        renderMembers();
        document.dispatchEvent(new CustomEvent("itc-admin-mode-change"));
    } catch (error) {
        adminLoginMessage.textContent = error instanceof TypeError
            ? "Tidak dapat menghubungi server login. Pastikan backend tersedia."
            : `Login gagal: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
});

document.querySelector("#adminLogoutBtn").addEventListener("click", async () => {
    showAdminMessage("Mengakhiri sesi admin...");
    try {
        const response = await fetch(adminLogoutEndpoint, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "X-CSRF-Token": adminCsrfToken
            },
            credentials: "same-origin"
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || `Server logout memberikan respons ${response.status}.`);
        }
    } catch (error) {
        showAdminMessage(error instanceof TypeError
            ? "Tidak dapat menghubungi server logout. Sesi admin tetap aktif; coba lagi."
            : `Logout gagal: ${error.message}`);
        return;
    }

    if (isEditingPageContent) {
        setPageContentEditing(false);
    }
    adminCsrfToken = "";
    isAdmin = false;
    setAdminSearchPlacement(false);
    setNavigationOpen(false);
    isSuperAdmin = false;
    isPrimarySuperAdmin = false;
    currentAdminId = "";
    if (createAdminRoleField) createAdminRoleField.hidden = true;
    document.body.classList.remove("admin-mode");
    document.body.classList.remove("super-admin-mode");
    adminToolbar.hidden = true;
    setAdminSidebarOpen(false);
    document.querySelector("#adminLoginOpen").querySelector("span").textContent = "Login Admin";
    adminLoginForm.reset();
    renderMembers();
    document.dispatchEvent(new CustomEvent("itc-admin-mode-change"));
});

document.querySelector("#editPageContentBtn").addEventListener("click", () => {
    if (!isSuperAdmin) return;
    if (isEditingPageContent) return;
    setPageContentEditing(true);
});

document.querySelector("#savePageContentBtn").addEventListener("click", async event => {
    if (!isSuperAdmin) return;
    const content = Object.fromEntries([...pageContentEditorFields.querySelectorAll("[data-page-content-key]")].map(input => [
        input.dataset.pageContentKey,
        input.value.trim()
    ]));

    const button = event.currentTarget;
    button.disabled = true;
    if (pageContentEditorStatus) pageContentEditorStatus.textContent = "Menyimpan teks halaman...";
    try {
        const response = await fetch(getSiteContentEndpoint(), {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": adminCsrfToken
            },
            credentials: "same-origin",
            body: JSON.stringify({ content })
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }

        editablePageTexts.forEach(element => {
            if (Object.prototype.hasOwnProperty.call(content, element.dataset.adminContentKey)) {
                element.textContent = content[element.dataset.adminContentKey];
            }
        });
        pageContentSnapshot = content;
        isProgramCountManuallySet = Object.prototype.hasOwnProperty.call(
            content,
            "program-count-value"
        );
        setPageContentEditing(false);
        showAdminMessage(result.message || "Perubahan teks berhasil disimpan ke database.");
        if (pageContentEditorStatus) pageContentEditorStatus.textContent = result.message || "Perubahan teks berhasil disimpan.";
    } catch (error) {
        showAdminMessage(`Perubahan teks tidak dapat disimpan: ${error.message}`);
        if (pageContentEditorStatus) pageContentEditorStatus.textContent = `Perubahan teks tidak dapat disimpan: ${error.message}`;
    } finally {
        button.disabled = false;
    }
});

document.querySelector("#cancelPageContentBtn").addEventListener("click", () => {
    setPageContentEditing(false);
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && isEditingPageContent) {
        setPageContentEditing(false);
        document.querySelector("#editPageContentBtn")?.focus();
    }
});

document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!isAdmin && target?.closest(".admin-only")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }
    if (!isSuperAdmin && target?.closest(".super-admin-only")) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

document.addEventListener("submit", event => {
    if (!isAdmin && event.target instanceof Element && event.target.closest(".admin-only")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }
    if (!isSuperAdmin && event.target instanceof Element && event.target.closest(".super-admin-only")) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

const menuBtn = document.querySelector("#menuBtn");
const navbar = document.querySelector("#navbar");

function setNavigationOpen(isOpen) {
    navbar.classList.toggle("open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute(
        "aria-label",
        isOpen ? "Tutup navigasi" : "Buka navigasi"
    );
}

menuBtn.addEventListener("click", () => {
    setNavigationOpen(menuBtn.getAttribute("aria-expanded") !== "true");
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 1024 && menuBtn.getAttribute("aria-expanded") === "true") {
        setNavigationOpen(false);
    }
});

navbar.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => setNavigationOpen(false));
});

document.addEventListener("click", event => {
    if (
        menuBtn.getAttribute("aria-expanded") === "true" &&
        !navbar.contains(event.target) &&
        !menuBtn.contains(event.target)
    ) {
        setNavigationOpen(false);
    }
});

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        menuBtn.getAttribute("aria-expanded") === "true"
    ) {
        setNavigationOpen(false);
        menuBtn.focus();
    }
});

const themeBtn = document.querySelector("#themeBtn");
function setTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    if (themeBtn) {
        themeBtn.innerHTML = `<i class="fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}"></i>`;
    }
    try {
        localStorage.setItem("itc-theme", theme);
    } catch (_) {}
}

let savedTheme = "light";
try {
    savedTheme = localStorage.getItem("itc-theme") || "light";
} catch (_) {}
setTheme(savedTheme);
if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        setTheme(document.body.classList.contains("dark") ? "light" : "dark");
    });
}

document.querySelector("#year").textContent = new Date().getFullYear();

const liveClock = document.querySelector("#liveClock");
const liveDate = document.querySelector("#liveDate");
const calendarMonthYear = document.querySelector("#calendarMonthYear");
const calendarDateGrid = document.querySelector("#calendarDateGrid");
const calendarSelected = document.querySelector("#calendarSelected");
const calendarPrev = document.querySelector("#calendarPrev");
const calendarNext = document.querySelector("#calendarNext");

if (
    liveClock &&
    liveDate &&
    calendarMonthYear &&
    calendarDateGrid &&
    calendarSelected &&
    calendarPrev &&
    calendarNext
) {
    const timeFormatter = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    });
    const dateFormatter = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    const monthFormatter = new Intl.DateTimeFormat("id-ID", {
        timeZone: "UTC",
        month: "long",
        year: "numeric"
    });
    const selectedDateFormatter = new Intl.DateTimeFormat("id-ID", {
        timeZone: "UTC",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    const jakartaDateFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "numeric",
        day: "numeric"
    });

    function getJakartaDate(now) {
        const parts = Object.fromEntries(
            jakartaDateFormatter
                .formatToParts(now)
                .map(part => [part.type, part.value])
        );
        const year = Number(parts.year);
        const month = Number(parts.month);
        const day = Number(parts.day);

        return {
            year,
            month,
            day,
            key: `${year}-${month}-${day}`
        };
    }

    function formatCalendarDate(year, month, day) {
        return selectedDateFormatter.format(
            new Date(Date.UTC(year, month, day))
        );
    }

    let today = getJakartaDate(new Date());
    let calendarYear = today.year;
    let calendarMonth = today.month - 1;
    let selectedDateKey = today.key;

    function renderCalendar() {
        const firstWeekday = new Date(
            Date.UTC(calendarYear, calendarMonth, 1)
        ).getUTCDay();
        const daysInMonth = new Date(
            Date.UTC(calendarYear, calendarMonth + 1, 0)
        ).getUTCDate();
        const leadingDays = (firstWeekday + 6) % 7;
        const fragment = document.createDocumentFragment();

        calendarMonthYear.textContent = monthFormatter.format(
            new Date(Date.UTC(calendarYear, calendarMonth, 1))
        );

        for (let index = 0; index < leadingDays; index += 1) {
            const emptyCell = document.createElement("span");
            emptyCell.setAttribute("aria-hidden", "true");
            fragment.append(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const dateKey = `${calendarYear}-${calendarMonth + 1}-${day}`;
            const dateButton = document.createElement("button");
            dateButton.type = "button";
            dateButton.textContent = String(day);
            dateButton.setAttribute(
                "aria-label",
                formatCalendarDate(calendarYear, calendarMonth, day)
            );
            dateButton.setAttribute(
                "aria-pressed",
                String(dateKey === selectedDateKey)
            );

            if (dateKey === today.key) {
                dateButton.classList.add("is-today");
            }
            if (dateKey === selectedDateKey) {
                dateButton.classList.add("is-selected");
            }

            dateButton.dataset.date = dateKey;
            fragment.append(dateButton);
        }

        calendarDateGrid.replaceChildren(fragment);
        if (selectedDateKey) {
            const [year, month, day] = selectedDateKey.split("-").map(Number);
            calendarSelected.textContent =
                `Tanggal dipilih: ${formatCalendarDate(year, month - 1, day)}`;
        } else {
            calendarSelected.textContent = "Pilih tanggal untuk melihatnya.";
        }
    }

    function updateClock() {
        const now = new Date();
        liveClock.textContent = timeFormatter.format(now);
        liveDate.textContent = dateFormatter.format(now);

        const nextToday = getJakartaDate(now);
        if (nextToday.key !== today.key) {
            const wasShowingCurrentMonth =
                calendarYear === today.year && calendarMonth === today.month - 1;
                            today = nextToday;
            if (wasShowingCurrentMonth) {
                calendarYear = today.year;
                calendarMonth = today.month - 1;
            }
            renderCalendar();
        }
    }

    calendarPrev.addEventListener("click", () => {
        calendarMonth -= 1;
        if (calendarMonth < 0) {
            calendarMonth = 11;
            calendarYear -= 1;
        }
        renderCalendar();
    });

    calendarNext.addEventListener("click", () => {
        calendarMonth += 1;
        if (calendarMonth > 11) {
            calendarMonth = 0;
            calendarYear += 1;
        }
        renderCalendar();
    });

    calendarDateGrid.addEventListener("click", event => {
        const dateButton = event.target.closest("button[data-date]");
        if (!dateButton || !calendarDateGrid.contains(dateButton)) {
            return;
        }

        selectedDateKey = dateButton.dataset.date;
        renderCalendar();
    });

    renderCalendar();
    updateClock();
    window.setInterval(updateClock, 1000);
}


// ======================================================
// PROGRAM KERJA - TERHUBUNG KE DATABASE MYSQL
// ======================================================

const programGrid = document.querySelector("#programGrid");
const programFilters = document.querySelector("#programFilters");
const programForm = document.querySelector("#programForm");
const programStatusMessage = document.querySelector("#programStatusMessage");
const emptyPrograms = document.querySelector("#emptyPrograms");
const programCount = document.querySelector("#programCount");
const searchInput = document.querySelector("#searchInput");
const programSearchResults = document.querySelector("#programSearchResults");
const programSearchSubmit = document.querySelector("#programSearchSubmit");

// Mengambil alamat API dari formulir login admin
function getProgramsEndpoint() {
    const endpoint = adminLoginForm?.dataset.programsEndpoint?.trim();

    if (!endpoint) {
        throw new Error("Alamat API Program Kerja belum diatur.");
    }

    return endpoint;
}

// Daftar status program
const programStatuses = {
    direncanakan: "Direncanakan",
    berlangsung: "Berlangsung",
    selesai: "Selesai"
};

function normalizeProgramSearchText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("id-ID")
        .trim();
}

function getProgramSearchText(item) {
    return normalizeProgramSearchText([
        item.title,
        item.description,
        programStatuses[item.status] || item.status,
        item.event_date,
        formatProgramDate(item.event_date)
    ].join(" "));
}

function hideProgramSearchResults() {
    if (programSearchResults) programSearchResults.hidden = true;
    searchInput?.setAttribute("aria-expanded", "false");
}

function renderProgramSearchResults() {
    if (!searchInput || !programSearchResults) return;
    const query = normalizeProgramSearchText(searchInput.value);
    if (!query) {
        hideProgramSearchResults();
        programSearchResults.replaceChildren();
        return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const matches = programItems.filter(item => {
        const searchable = getProgramSearchText(item);
        return terms.every(term => searchable.includes(term));
    });

    const results = matches.slice(0, 8).map(item => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "program-search-result";
        option.setAttribute("role", "option");
        option.dataset.programSearchResult = String(item.id);

        const title = document.createElement("strong");
        title.textContent = item.title || "Program tanpa judul";
        const detail = document.createElement("small");
        detail.textContent = [
            programStatuses[item.status] || "Status belum ditentukan",
            item.event_date ? formatProgramDate(item.event_date) : ""
        ].filter(Boolean).join(" · ");
        option.append(title, detail);
        return option;
    });

    if (matches.length === 0) {
        const empty = document.createElement("p");
        empty.className = "program-search-empty";
        empty.setAttribute("role", "option");
        empty.setAttribute("aria-disabled", "true");
        empty.textContent = programItems.length
            ? "Program tidak ditemukan. Coba kata kunci lain."
            : "Data program belum tersedia.";
        results.push(empty);
    }

    programSearchResults.replaceChildren(...results);
    programSearchResults.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
}

function selectProgramSearchResult(programId) {
    const item = programItems.find(program => String(program.id) === String(programId));
    if (!item) return;

    searchInput.value = item.title || "";
    programFilters.querySelectorAll(".filter-btn").forEach(button => {
        const selected = button.dataset.filter === "all";
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
    renderPrograms();
    hideProgramSearchResults();
    searchInput.blur();

    if (isAdmin) {
        setAdminSidebarOpen(false);
        openAdminContentWorkspaceView("program", "openProgramWorkspaceBtn");
    } else {
        document.querySelector("#program")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    requestAnimationFrame(() => {
        const card = [...programGrid.querySelectorAll(".program-card")]
            .find(element => element.dataset.programId === String(item.id));
        card?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (card) {
            card.classList.add("program-search-target");
            window.setTimeout(() => card.classList.remove("program-search-target"), 1800);
        }
    });
}

programSearchSubmit?.addEventListener("click", () => {
    renderPrograms();
    renderProgramSearchResults();
    const firstResult = programSearchResults?.querySelector("[data-program-search-result]");
    if (firstResult) selectProgramSearchResult(firstResult.dataset.programSearchResult);
    else searchInput?.focus();
});

programSearchResults?.addEventListener("click", event => {
    const option = event.target.closest("[data-program-search-result]");
    if (option) selectProgramSearchResult(option.dataset.programSearchResult);
});

searchInput?.addEventListener("keydown", event => {
    if (event.key === "Escape" && programSearchResults && !programSearchResults.hidden) {
        hideProgramSearchResults();
        event.stopPropagation();
    }
    if (event.key === "Enter" && programSearchResults && !programSearchResults.hidden) {
        const firstResult = programSearchResults.querySelector("[data-program-search-result]");
        if (firstResult) {
            event.preventDefault();
            selectProgramSearchResult(firstResult.dataset.programSearchResult);
        }
    }
});

document.addEventListener("pointerdown", event => {
    if (programSearchResults && !programSearchBox?.contains(event.target)) hideProgramSearchResults();
});

const programIcons = {
    camera: { symbol: "📷", label: "Kamera" },
    "laptop-code": { symbol: "💻", label: "Laptop dan teknologi" },
    palette: { symbol: "🎨", label: "Desain grafis" },
    bullhorn: { symbol: "📣", label: "Publikasi" },
    "calendar-days": { symbol: "📅", label: "Kegiatan" },
    globe: { symbol: "🌐", label: "Web dan internet" },
    lightbulb: { symbol: "💡", label: "Ide kreatif" },
    gear: { symbol: "⚙️", label: "Teknologi" }
};

// Mengambil elemen formulir
const programTitleInput = document.querySelector("#programTitle");
const programDescriptionInput = document.querySelector("#programDescription");
const programStatusInput = document.querySelector("#programStatus");
const programDateInput = document.querySelector("#programDate");
const programImageInput = document.querySelector("#programImage");
const programIconInput = document.querySelector("#programIcon");
const programIconPreview = document.querySelector("#programIconPreview");
const programEditId = document.querySelector("#programEditId");
const programFormTitle = document.querySelector("#programFormTitle");
const addProgramButton = document.querySelector("#addProgramBtn");
const cancelProgramButton = document.querySelector("#cancelProgramBtn");
const saveProgramButton = document.querySelector("#saveProgramBtn");

// Data program yang diambil dari database
let programItems = [];

// ======================================================
// PESAN STATUS
// ======================================================

function setProgramStatus(message) {
    programStatusMessage.textContent = message;
}

// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatProgramDate(value) {
    if (!value) {
        return "Belum ditentukan";
    }

    const [year, month, day] = value.split("-").map(Number);

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(year, month - 1, day));
}

// ======================================================
// ALAMAT FOTO PROGRAM
// ======================================================

function getProgramImageUrl(image) {
    if (!image) {
        return "";
    }

    // Jika database sudah menyimpan path uploads/...
    if (image.startsWith("uploads/")) {
        return image;
    }

    // Jika database menyimpan programs/nama-file.jpg
    if (image.startsWith("programs/")) {
        return `uploads/${image}`;
    }

    // Jika PHP hanya mengembalikan nama file
    return `uploads/programs/${image}`;
}

// ======================================================
// GAMBAR PENGGANTI JIKA FOTO TIDAK ADA
// ======================================================

function createProgramPlaceholder(title, iconKey = "camera") {
    const placeholder = document.createElement("div");

    placeholder.className = "program-image program-image-placeholder";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute(
        "aria-label",
        `${programIcons[iconKey]?.label || programIcons.camera.label} untuk ${title}`
    );

    const icon = document.createElement("span");
    icon.className = "program-icon-glyph";
    icon.textContent = programIcons[iconKey]?.symbol || programIcons.camera.symbol;
    icon.setAttribute("aria-hidden", "true");

    placeholder.append(icon);

    return placeholder;
}

// ======================================================
// MEMBUAT KARTU PROGRAM
// ======================================================

function createProgramCard(item) {
    const article = document.createElement("article");

    article.className = "program-card";
    article.dataset.programId = String(item.id);
    article.dataset.category = item.status;

    article.dataset.search =
        `${item.title} ${item.description}`.toLocaleLowerCase("id-ID");

    // Foto program
    const imageUrl = getProgramImageUrl(item.image);

    if (imageUrl) {
        const visual = document.createElement("div");
        visual.className = "program-visual";
        const image = document.createElement("img");

        image.className = "program-image";
        image.src = imageUrl;
        image.alt = item.title;
        image.loading = "lazy";

        image.addEventListener("error", () => {
            visual.replaceWith(createProgramPlaceholder(item.title, item.icon));
        }, { once: true });

        visual.append(image);
        article.append(visual);
    } else {
        article.append(
            createProgramPlaceholder(item.title, item.icon)
        );
    }

    // Konten program
    const content = document.createElement("div");
    content.className = "program-content";

    // Status
    const status = document.createElement("span");

    status.className = `program-status ${item.status}`;
    status.textContent =
        programStatuses[item.status] || "Direncanakan";

    // Judul
    const title = document.createElement("h3");
    title.textContent = item.title;

    // Deskripsi
    const description = document.createElement("p");
    description.textContent = item.description;

    // Tanggal
    const date = document.createElement("p");
    date.className = "program-date";

    const dateIcon = document.createElement("i");
    dateIcon.className = "fa-regular fa-calendar";
    dateIcon.setAttribute("aria-hidden", "true");

    date.append(
        dateIcon,
        document.createTextNode(
            formatProgramDate(item.event_date)
        )
    );

    content.append(
        status,
        title,
        description,
        date
    );

    // Tombol pengelolaan hanya untuk admin
    if (isAdmin) {
        const actions = document.createElement("div");

        actions.className = "program-actions admin-only";

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "btn-edit-program admin-only";
        editButton.dataset.programAction = "edit";
        editButton.dataset.programId = item.id;

        editButton.innerHTML =
            '<i class="fa-solid fa-pen" aria-hidden="true"></i> Edit';

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "btn-delete-program admin-only";
        deleteButton.dataset.programAction = "delete";
        deleteButton.dataset.programId = item.id;

        deleteButton.innerHTML =
            '<i class="fa-solid fa-trash" aria-hidden="true"></i> Hapus';

        actions.append(editButton, deleteButton);
        content.append(actions);
    }

    article.append(content);

    return article;
}

// ======================================================
// MENAMPILKAN PROGRAM DAN FILTER
// ======================================================

function renderPrograms() {
    const activeFilter =
        programFilters.querySelector(".filter-btn.active")
            ?.dataset.filter || "all";

    const searchTerms = normalizeProgramSearchText(searchInput?.value || "")
        .split(/\s+/)
        .filter(Boolean);

    const visibleItems = programItems.filter(item => {
        const matchesFilter =
            activeFilter === "all" ||
            item.status === activeFilter;

        const searchableText = getProgramSearchText(item);
        const matchesSearch = searchTerms.every(term => searchableText.includes(term));

        return matchesFilter && matchesSearch;
    });

    programGrid.replaceChildren(
        ...visibleItems.map(createProgramCard)
    );

    emptyPrograms.hidden = visibleItems.length > 0;

    emptyPrograms.textContent =
        programItems.length === 0
            ? "Belum ada program kerja yang tersedia."
            : "Tidak ada program kerja yang cocok dengan filter atau pencarian.";

    if (programCount && !isProgramCountManuallySet && !isEditingPageContent) {
        programCount.textContent = String(programItems.length);
    }
}

// ======================================================
// MENGAMBIL DATA PROGRAM DARI DATABASE
// ======================================================

async function loadPrograms() {
    try {
        const response = await fetch(getProgramsEndpoint(), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "same-origin",
            cache: "no-store"
        });

        const result = await response.json();

        if (
            !response.ok ||
            result.success !== true ||
            !Array.isArray(result.data)
        ) {
            throw new Error(
                result.message ||
                `Server memberikan respons ${response.status}.`
            );
        }

        programItems = result.data;

        renderPrograms();
        renderProgramSearchResults();

        setProgramStatus(
            "Data program kerja berhasil dimuat dari database."
        );

    } catch (error) {
        console.error("Gagal memuat program:", error);

        programItems = [];
        renderPrograms();
        renderProgramSearchResults();

        setProgramStatus(
            `Program kerja gagal dimuat: ${error.message}`
        );
    }
}

// ======================================================
// MEMANTAU PERUBAHAN STATUS LOGIN ADMIN
// ======================================================

document.addEventListener(
    "itc-admin-mode-change",
    renderPrograms
);

// ======================================================
// RESET FORM PROGRAM
// ======================================================

function resetProgramForm() {
    programForm.reset();

    updateProgramIconPreview();

    programImageInput.setCustomValidity("");

    programEditId.value = "";

    programFormTitle.textContent = "Tambah Program Kerja";

    programForm.hidden = true;
}

function updateProgramIconPreview() {
    if (!programIconPreview || !programIconInput) return;
    programIconPreview.textContent = programIcons[programIconInput.value]?.symbol || programIcons.camera.symbol;
}

programIconInput?.addEventListener("change", updateProgramIconPreview);

// ======================================================
// VALIDASI FOTO PROGRAM
// ======================================================

function updateProgramImageValidity() {
    const selectedFile = programImageInput.files[0];

    let errorMessage = "";

    if (
        selectedFile &&
        !["image/jpeg", "image/png", "image/webp"]
            .includes(selectedFile.type)
    ) {
        errorMessage =
            "Pilih foto berformat JPG, PNG, atau WebP.";
    } else if (
        selectedFile &&
        selectedFile.size > 10 * 1024 * 1024
    ) {
        errorMessage =
            "Ukuran foto maksimal 10 MB.";
    }

    programImageInput.setCustomValidity(errorMessage);
}

programImageInput.addEventListener(
    "change",
    updateProgramImageValidity
);

// ======================================================
// TOMBOL TAMBAH PROGRAM
// ======================================================

addProgramButton.addEventListener("click", () => {
    if (!isAdmin) {
        return;
    }

    resetProgramForm();

    setProgramStatus("");

    programForm.hidden = false;

    programTitleInput.focus();
});

// ======================================================
// TOMBOL BATAL
// ======================================================

cancelProgramButton.addEventListener(
    "click",
    resetProgramForm
);

// ======================================================
// FILTER PROGRAM
// ======================================================

programFilters.addEventListener("click", event => {
    const filterButton = event.target.closest("[data-filter]");

    if (
        !filterButton ||
        !programFilters.contains(filterButton)
    ) {
        return;
    }

    programFilters.querySelectorAll(".filter-btn")
        .forEach(button => {
            const isActive = button === filterButton;

            button.classList.toggle("active", isActive);

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

    renderPrograms();
});

// ======================================================
// PENCARIAN PROGRAM
// ======================================================

searchInput?.addEventListener("input", () => {
    renderPrograms();
    renderProgramSearchResults();
});

// ======================================================
// EDIT DAN HAPUS PROGRAM
// ======================================================

programGrid.addEventListener("click", async event => {
    if (!isAdmin) {
        return;
    }

    const actionButton =
        event.target.closest("[data-program-action]");

    if (!actionButton) {
        return;
    }

    const item = programItems.find(
        program =>
            String(program.id) === actionButton.dataset.programId
    );

    if (!item) {
        return;
    }

    // EDIT PROGRAM
    if (actionButton.dataset.programAction === "edit") {
        programEditId.value = item.id;

        programTitleInput.value = item.title;
        programDescriptionInput.value = item.description;
        programStatusInput.value = item.status;
        programDateInput.value = item.event_date || "";
        programIconInput.value = programIcons[item.icon] ? item.icon : "camera";
        updateProgramIconPreview();

        programImageInput.value = "";
        programImageInput.setCustomValidity("");

        programFormTitle.textContent = "Ubah Program Kerja";

        programForm.hidden = false;

        programTitleInput.focus();

        return;
    }

    // HAPUS PROGRAM
    if (
        actionButton.dataset.programAction === "delete" &&
        window.confirm(
            `Hapus "${item.title}" dari program kerja?`
        )
    ) {
        const formData = new FormData();

        formData.set("action", "delete");
        formData.set("id", item.id);

        actionButton.disabled = true;

        setProgramStatus(
            "Menghapus program dari database..."
        );

        try {
            const response = await fetch(getProgramsEndpoint(), {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "X-CSRF-Token": adminCsrfToken
                },
                credentials: "same-origin",
                body: formData
            });

            const result = await response.json();

            if (!response.ok || result.success !== true) {
                throw new Error(
                    result.message ||
                    `Server memberikan respons ${response.status}.`
                );
            }

            await loadPrograms();

            setProgramStatus(
                "Program berhasil dihapus dari database."
            );

        } catch (error) {
            setProgramStatus(
                `Program gagal dihapus: ${error.message}`
            );

            actionButton.disabled = false;
        }
    }
});

// ======================================================
// SIMPAN PROGRAM: TAMBAH DAN EDIT
// ======================================================

programForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!isAdmin) {
        setProgramStatus(
            "Silakan login sebagai admin terlebih dahulu."
        );
        return;
    }

    updateProgramImageValidity();

    if (!programForm.reportValidity()) {
        return;
    }

    const selectedFile = programImageInput.files[0];

    const formData = new FormData();

    // Jika ID kosong, PHP akan menambahkan program baru.
    // Jika ID berisi angka, PHP akan mengedit program tersebut.
    formData.set("action", "save");
    formData.set("id", programEditId.value);
    formData.set("title", programTitleInput.value.trim());
    formData.set(
        "description",
        programDescriptionInput.value.trim()
    );
    formData.set("status", programStatusInput.value);
    formData.set("event_date", programDateInput.value);
    formData.set("icon", programIconInput.value);

    // Foto dikirim sebagai file asli ke PHP.
    if (selectedFile) {
        formData.set("image", selectedFile);
    }

    saveProgramButton.disabled = true;

    saveProgramButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

    setProgramStatus(
        "Menyimpan program kerja ke database..."
    );

    try {
        const response = await fetch(getProgramsEndpoint(), {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "X-CSRF-Token": adminCsrfToken
            },
            credentials: "same-origin",
            body: formData
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
            throw new Error(
                result.message ||
                `Server memberikan respons ${response.status}.`
            );
        }

        // Kembali ke filter Semua
        programFilters.querySelectorAll(".filter-btn")
            .forEach(button => {
                const isAllFilter =
                    button.dataset.filter === "all";

                button.classList.toggle("active", isAllFilter);

                button.setAttribute(
                    "aria-pressed",
                    String(isAllFilter)
                );
            });

        // Bersihkan pencarian
        if (searchInput) {
            searchInput.value = "";
        }

        // Ambil kembali data terbaru dari database
        await loadPrograms();

        resetProgramForm();

        setProgramStatus(
            result.message || "Program berhasil disimpan."
        );

    } catch (error) {
        console.error("Gagal menyimpan program:", error);

        setProgramStatus(
            `Program gagal disimpan: ${error.message}`
        );

    } finally {
        saveProgramButton.disabled = false;

        saveProgramButton.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Simpan Program';
    }
});

// ======================================================
// JALANKAN SAAT HALAMAN DIBUKA
// ======================================================

loadPrograms();


// ======================================================
// GALERI - TERHUBUNG KE DATABASE MYSQL
// ======================================================

const galleryGrid = document.querySelector("#galleryGrid");
const galleryFilters = document.querySelector("#galleryFilters");
const galleryForm = document.querySelector("#galleryForm");
const galleryStatus = document.querySelector("#galleryStatus");
const emptyGallery = document.querySelector("#emptyGallery");

// Mengambil alamat API Galeri dari formulir login admin
function getGalleryEndpoint() {
    const endpoint = adminLoginForm?.dataset.galleryEndpoint?.trim();

    if (!endpoint) {
        throw new Error("Alamat API Galeri belum diatur.");
    }

    return endpoint;
}

// Kategori galeri
const galleryCategories = {
    kegiatan: {
        label: "Kegiatan",
        icon: "🎉"
    },
    dokumentasi: {
        label: "Dokumentasi",
        icon: "📸"
    },
    desain: {
        label: "Desain",
        icon: "🎨"
    }
};

// Mengambil elemen formulir
const galleryTitleInput = document.querySelector("#galleryTitle");
const galleryDescriptionInput = document.querySelector("#galleryDescription");
const galleryCategoryInput = document.querySelector("#galleryCategory");
const galleryDateInput = document.querySelector("#galleryDate");
const galleryImageInput = document.querySelector("#galleryImage");
const galleryDriveUrlInput = document.querySelector("#galleryDriveUrl");
const galleryEditId = document.querySelector("#galleryEditId");
const galleryFormTitle = document.querySelector("#galleryFormTitle");
const addGalleryButton = document.querySelector("#addGalleryBtn");
const cancelGalleryButton = document.querySelector("#cancelGalleryBtn");
const saveGalleryButton = document.querySelector("#saveGalleryBtn");

// Data galeri dari database
let galleryItems = [];


// ======================================================
// VALIDASI TAUTAN GOOGLE DRIVE
// ======================================================

function isGoogleDriveUrl(value) {
    if (!value) {
        return true;
    }

    try {
        const url = new URL(value);

        return url.protocol === "https:" &&
            (
                url.hostname === "drive.google.com" ||
                url.hostname.endsWith(".drive.google.com") ||
                url.hostname === "docs.google.com" ||
                url.hostname.endsWith(".docs.google.com")
            );
    } catch (_) {
        return false;
    }
}


// ======================================================
// PESAN STATUS GALERI
// ======================================================

function setGalleryStatus(message) {
    if (galleryStatus) {
        galleryStatus.textContent = message;
    }
}

async function readGalleryResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
        throw new Error(
            `API galeri mengembalikan respons bukan JSON (HTTP ${response.status}). Periksa alamat API.`
        );
    }

    return response.json();
}


// ======================================================
// FORMAT TANGGAL GALERI
// ======================================================

function formatGalleryDate(value) {
    if (!value) {
        return "Tanggal belum ditentukan";
    }

    const [year, month, day] = value.split("-").map(Number);

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(year, month - 1, day));
}


// ======================================================
// ALAMAT FOTO GALERI
// ======================================================

function getGalleryImageUrl(image) {
    if (!image) {
        return "";
    }

    // Jika database sudah menyimpan path uploads/...
    if (image.startsWith("uploads/")) {
        return image;
    }

    // Jika database menyimpan galleries/nama-file.jpg
    if (image.startsWith("galleries/")) {
        return `uploads/${image}`;
    }

    // Jika PHP hanya mengembalikan nama file
    return `uploads/gallery/${image}`;
}


// ======================================================
// GAMBAR PENGGANTI JIKA FOTO TIDAK ADA
// ======================================================

function createGalleryPlaceholder(title, icon) {
    const artwork = document.createElement("div");

    artwork.className = "gallery-art";
    artwork.setAttribute("role", "img");
    artwork.setAttribute(
        "aria-label",
        `Tidak ada foto untuk ${title}`
    );

    const iconElement = document.createElement("span");

    iconElement.className = "gallery-art-icon";
    iconElement.setAttribute("aria-hidden", "true");
    iconElement.textContent = icon;

    artwork.append(iconElement);

    return artwork;
}


// ======================================================
// MEMBUAT KARTU GALERI
// ======================================================

function createGalleryCard(item) {
    const category =
        galleryCategories[item.category] ||
        galleryCategories.dokumentasi;

    const article = document.createElement("article");

    article.className = "gallery-item";
    article.dataset.category = item.category;

    // Bagian foto
    const imageUrl = getGalleryImageUrl(item.image);

    let artwork;

    if (imageUrl) {
        artwork = document.createElement("div");
        artwork.className = "gallery-art";

        const photo = document.createElement("img");

        photo.className = "gallery-photo";
        photo.src = imageUrl;
        photo.alt = item.title;
        photo.loading = "lazy";

        photo.addEventListener("error", () => {
            artwork.replaceWith(
                createGalleryPlaceholder(
                    item.title,
                    category.icon
                )
            );
        }, { once: true });

        artwork.append(photo);
    } else {
        artwork = createGalleryPlaceholder(
            item.title,
            category.icon
        );
    }

    // Bagian informasi
    const content = document.createElement("div");

    content.className = "gallery-content";

    // Kategori
    const categoryLabel = document.createElement("span");

    categoryLabel.className = "gallery-category";
    categoryLabel.textContent = category.label;

    // Judul
    const title = document.createElement("h3");

    title.textContent = item.title;

    // Deskripsi
    const description = document.createElement("p");

    description.textContent =
        item.description || "Dokumentasi kegiatan ITC SMAN 1 Balige.";

    // Tanggal
    const date = document.createElement("small");

    date.className = "gallery-date";
    date.textContent = formatGalleryDate(item.event_date);

    content.append(
        categoryLabel,
        title,
        description,
        date
    );

    // Tombol pengelolaan dan tautan Drive
    const actions = document.createElement("div");

    actions.className = "gallery-actions";

    // Tautan Google Drive
    if (item.drive_url && isGoogleDriveUrl(item.drive_url)) {
        const driveLink = document.createElement("a");

        driveLink.href = item.drive_url;
        driveLink.target = "_blank";
        driveLink.rel = "noopener noreferrer";
        driveLink.textContent = "Buka Google Drive";

        actions.append(driveLink);
    }

    // Tombol admin
    if (isAdmin) {
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "admin-only";
        editButton.dataset.galleryAction = "edit";
        editButton.dataset.galleryId = String(item.id);
        editButton.innerHTML =
            '<i class="fa-solid fa-pen" aria-hidden="true"></i> Edit';

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "gallery-delete admin-only";
        deleteButton.dataset.galleryAction = "delete";
        deleteButton.dataset.galleryId = String(item.id);
        deleteButton.innerHTML =
            '<i class="fa-solid fa-trash" aria-hidden="true"></i> Hapus';

        actions.append(editButton, deleteButton);
    }

    if (actions.childElementCount > 0) {
        content.append(actions);
    }

    article.append(artwork, content);

    return article;
}


// ======================================================
// MENAMPILKAN GALERI DAN FILTER KATEGORI
// ======================================================

function renderGallery() {
    const activeFilter =
        galleryFilters.querySelector(".filter-btn.active")
            ?.dataset.filter || "all";

    const visibleItems = galleryItems.filter(item => {
        return activeFilter === "all" ||
            item.category === activeFilter;
    });

    galleryGrid.replaceChildren(
        ...visibleItems.map(createGalleryCard)
    );

    emptyGallery.hidden = visibleItems.length > 0;

    if (galleryItems.length === 0) {
        emptyGallery.textContent =
            "Belum ada dokumentasi galeri yang tersedia.";
    } else if (visibleItems.length === 0) {
        emptyGallery.textContent =
            `Belum ada dokumentasi untuk kategori ${
                galleryCategories[activeFilter]?.label || activeFilter
            }.`;
    }
}


// ======================================================
// MENGAMBIL DATA GALERI DARI DATABASE
// ======================================================

async function loadGallery() {
    try {
        const response = await fetch(getGalleryEndpoint(), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "same-origin",
            cache: "no-store"
        });

        const result = await readGalleryResponse(response);

        if (
            !response.ok ||
            result.success !== true ||
            !Array.isArray(result.data)
        ) {
            throw new Error(
                result.message ||
                `Server memberikan respons ${response.status}.`
            );
        }

        galleryItems = result.data;

        renderGallery();

        setGalleryStatus(
            "Data galeri berhasil dimuat dari database."
        );

    } catch (error) {
        console.error("Gagal memuat galeri:", error);

        galleryItems = [];

        renderGallery();

        setGalleryStatus(
            `Galeri gagal dimuat: ${error.message}`
        );
    }
}


// ======================================================
// MEMANTAU PERUBAHAN STATUS LOGIN ADMIN
// ======================================================

document.addEventListener(
    "itc-admin-mode-change",
    renderGallery
);


// ======================================================
// RESET FORM GALERI
// ======================================================

function resetGalleryForm() {
    galleryForm.reset();

    galleryImageInput.setCustomValidity("");
    galleryDriveUrlInput.setCustomValidity("");

    galleryEditId.value = "";

    galleryFormTitle.textContent = "Tambah Galeri";

    galleryForm.hidden = true;
}


// ======================================================
// VALIDASI FOTO DAN GOOGLE DRIVE
// ======================================================

function updateGallerySourceValidity() {
    const driveUrl = galleryDriveUrlInput.value.trim();
    const selectedFile = galleryImageInput.files[0];

    const existingItem = galleryItems.find(
        item => String(item.id) === galleryEditId.value
    );

    const hasSavedImage = Boolean(existingItem?.image);
    let imageError = "";

    // Validasi format foto
    if (
        selectedFile &&
        !["image/jpeg", "image/png", "image/webp"]
            .includes(selectedFile.type)
    ) {
        imageError =
            "Pilih foto berformat JPG, PNG, atau WebP.";
    }

    // Validasi ukuran foto maksimal 10 MB
    else if (
        selectedFile &&
        selectedFile.size > 10 * 1024 * 1024
    ) {
        imageError =
            "Ukuran foto maksimal 10 MB.";
    }

    // Foto atau tautan Drive wajib tersedia
    else if (
        !selectedFile &&
        !hasSavedImage &&
        !driveUrl
    ) {
        imageError =
            "Pilih foto atau masukkan tautan Google Drive.";
    }

    galleryImageInput.setCustomValidity(imageError);

    galleryDriveUrlInput.setCustomValidity(
        isGoogleDriveUrl(driveUrl)
            ? ""
            : "Masukkan tautan HTTPS Google Drive atau Google Docs yang valid."
    );
}

galleryImageInput.addEventListener(
    "change",
    updateGallerySourceValidity
);

galleryDriveUrlInput.addEventListener(
    "input",
    updateGallerySourceValidity
);


// ======================================================
// TOMBOL TAMBAH GALERI
// ======================================================

addGalleryButton.addEventListener("click", () => {
    if (!isAdmin) {
        return;
    }

    resetGalleryForm();

    setGalleryStatus("");

    galleryForm.hidden = false;

    galleryTitleInput.focus();
});


// ======================================================
// TOMBOL BATAL
// ======================================================

cancelGalleryButton.addEventListener(
    "click",
    resetGalleryForm
);


// ======================================================
// FILTER KATEGORI GALERI
// ======================================================

galleryFilters.addEventListener("click", event => {
    const filterButton = event.target.closest("[data-filter]");

    if (
        !filterButton ||
        !galleryFilters.contains(filterButton)
    ) {
        return;
    }

    galleryFilters.querySelectorAll(".filter-btn")
        .forEach(button => {
            const isActive = button === filterButton;

            button.classList.toggle("active", isActive);

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

    renderGallery();
});


// ======================================================
// EDIT DAN HAPUS GALERI
// ======================================================

galleryGrid.addEventListener("click", async event => {
    if (!isAdmin) {
        return;
    }

    const actionButton =
        event.target.closest("[data-gallery-action]");

    if (!actionButton) {
        return;
    }

    const item = galleryItems.find(
        galleryItem =>
            String(galleryItem.id) === actionButton.dataset.galleryId
    );

    if (!item) {
        return;
    }

    // EDIT GALERI
    if (actionButton.dataset.galleryAction === "edit") {
        galleryEditId.value = item.id;

        galleryTitleInput.value = item.title;
        galleryDescriptionInput.value = item.description || "";
        galleryCategoryInput.value = item.category;
        galleryDateInput.value = item.event_date || "";

        galleryImageInput.value = "";
        galleryImageInput.setCustomValidity("");

        galleryDriveUrlInput.value = item.drive_url || "";
        galleryDriveUrlInput.setCustomValidity("");

        galleryFormTitle.textContent = "Ubah Galeri";

        galleryForm.hidden = false;

        updateGallerySourceValidity();

        galleryTitleInput.focus();

        return;
    }

    // HAPUS GALERI
    if (
        actionButton.dataset.galleryAction === "delete" &&
        window.confirm(`Hapus "${item.title}" dari galeri?`)
    ) {
        const formData = new FormData();

        formData.set("action", "delete");
        formData.set("id", item.id);

        actionButton.disabled = true;

        setGalleryStatus(
            "Menghapus dokumentasi dari database..."
        );

        try {
            const response = await fetch(getGalleryEndpoint(), {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "X-CSRF-Token": adminCsrfToken
                },
                credentials: "same-origin",
                body: formData
            });

            const result = await readGalleryResponse(response);

            if (!response.ok || result.success !== true) {
                throw new Error(
                    result.message ||
                    `Server memberikan respons ${response.status}.`
                );
            }

            await loadGallery();

            setGalleryStatus(
                result.message || "Dokumentasi berhasil dihapus."
            );

        } catch (error) {
            console.error("Gagal menghapus galeri:", error);

            setGalleryStatus(
                `Galeri gagal dihapus: ${error.message}`
            );

            actionButton.disabled = false;
        }
    }
});


// ======================================================
// SIMPAN GALERI: TAMBAH DAN EDIT
// ======================================================

galleryForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!isAdmin) {
        setGalleryStatus(
            "Silakan login sebagai admin terlebih dahulu."
        );
        return;
    }

    updateGallerySourceValidity();

    if (!galleryForm.reportValidity()) {
        return;
    }

    const selectedFile = galleryImageInput.files[0];

    const formData = new FormData();

    // Data utama
    formData.set("action", "save");
    formData.set("id", galleryEditId.value);
    formData.set("title", galleryTitleInput.value.trim());

    formData.set(
        "description",
        galleryDescriptionInput.value.trim()
    );

    formData.set(
        "category",
        galleryCategoryInput.value
    );

    formData.set(
        "event_date",
        galleryDateInput.value
    );

    formData.set(
        "drive_url",
        galleryDriveUrlInput.value.trim()
    );

    // Foto dikirim sebagai file asli ke PHP
    if (selectedFile) {
        formData.set("image", selectedFile);
    }

    saveGalleryButton.disabled = true;

    saveGalleryButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

    setGalleryStatus(
        "Menyimpan dokumentasi galeri ke database..."
    );

    try {
        const response = await fetch(getGalleryEndpoint(), {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "X-CSRF-Token": adminCsrfToken
            },
            credentials: "same-origin",
            body: formData
        });

        const result = await readGalleryResponse(response);

        if (!response.ok || result.success !== true) {
            throw new Error(
                result.message ||
                `Server memberikan respons ${response.status}.`
            );
        }

        // Kembali ke filter Semua
        galleryFilters.querySelectorAll(".filter-btn")
            .forEach(button => {
                const isAllFilter =
                    button.dataset.filter === "all";

                button.classList.toggle("active", isAllFilter);

                button.setAttribute(
                    "aria-pressed",
                    String(isAllFilter)
                );
            });

        // Ambil data terbaru dari database
        await loadGallery();

        // Tutup dan bersihkan formulir
        resetGalleryForm();

        setGalleryStatus(
            result.message || "Dokumentasi berhasil disimpan."
        );

    } catch (error) {
        console.error("Gagal menyimpan galeri:", error);

        setGalleryStatus(
            `Galeri gagal disimpan: ${error.message}`
        );

    } finally {
        saveGalleryButton.disabled = false;

        saveGalleryButton.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Simpan Galeri';
    }
});


// ======================================================
// JALANKAN SAAT HALAMAN DIBUKA
// ======================================================

loadGallery();
function createSquarePhotoCropper({ editor, viewport, image, zoom, reset, fileName }) {
    let objectUrl = "";
    let imageIsReady = false;
    let imageLoadPromise = Promise.resolve();
    let baseScale = 1;
    let state = { x: 0, y: 0, zoom: 1 };

    function clampPosition() {
        const frameWidth = viewport.clientWidth;
        const frameHeight = viewport.clientHeight;
        const renderWidth = image.naturalWidth * baseScale * state.zoom;
        const renderHeight = image.naturalHeight * baseScale * state.zoom;
        state.x = Math.min(0, Math.max(frameWidth - renderWidth, state.x));
        state.y = Math.min(0, Math.max(frameHeight - renderHeight, state.y));
    }

    function render(recenter = false) {
        if (!imageIsReady) return;
        const frameWidth = viewport.clientWidth;
        const frameHeight = viewport.clientHeight;
        const oldScale = baseScale * state.zoom;
        const sourceCenterX = recenter ? null : (frameWidth / 2 - state.x) / oldScale;
        const sourceCenterY = recenter ? null : (frameHeight / 2 - state.y) / oldScale;
        state.zoom = Math.max(1, Math.min(3, Number(zoom.value) || 1));
        baseScale = Math.max(frameWidth / image.naturalWidth, frameHeight / image.naturalHeight);
        const scale = baseScale * state.zoom;
        const renderWidth = image.naturalWidth * scale;
        const renderHeight = image.naturalHeight * scale;
        state.x = recenter || sourceCenterX === null ? (frameWidth - renderWidth) / 2 : frameWidth / 2 - sourceCenterX * scale;
        state.y = recenter || sourceCenterY === null ? (frameHeight - renderHeight) / 2 : frameHeight / 2 - sourceCenterY * scale;
        clampPosition();
        image.style.width = `${renderWidth}px`;
        image.style.height = `${renderHeight}px`;
        image.style.left = `${state.x}px`;
        image.style.top = `${state.y}px`;
    }

    function load(file) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        imageIsReady = false;
        objectUrl = URL.createObjectURL(file);
        editor.hidden = false;
        zoom.value = "1";
        imageLoadPromise = new Promise((resolve, reject) => {
            image.onload = () => {
                imageIsReady = true;
                render(true);
                resolve();
            };
            image.onerror = () => {
                imageIsReady = false;
                editor.hidden = true;
                reject(new Error("Foto tidak dapat dibaca oleh browser."));
            };
        });
        image.src = objectUrl;
        return imageLoadPromise;
    }

    let dragPoint = null;
    viewport.addEventListener("pointerdown", event => {
        if (!imageIsReady) return;
        dragPoint = { x: event.clientX, y: event.clientY };
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add("is-dragging");
        event.preventDefault();
    });
    viewport.addEventListener("pointermove", event => {
        if (!dragPoint || !imageIsReady) return;
        state.x += event.clientX - dragPoint.x;
        state.y += event.clientY - dragPoint.y;
        dragPoint = { x: event.clientX, y: event.clientY };
        clampPosition();
        image.style.left = `${state.x}px`;
        image.style.top = `${state.y}px`;
    });
    const stopDragging = () => {
        dragPoint = null;
        viewport.classList.remove("is-dragging");
    };
    viewport.addEventListener("pointerup", stopDragging);
    viewport.addEventListener("pointercancel", stopDragging);
    viewport.addEventListener("keydown", event => {
        if (!imageIsReady || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
        const movement = event.shiftKey ? 2 : 10;
        if (event.key === "ArrowLeft") state.x += movement;
        if (event.key === "ArrowRight") state.x -= movement;
        if (event.key === "ArrowUp") state.y += movement;
        if (event.key === "ArrowDown") state.y -= movement;
        clampPosition();
        image.style.left = `${state.x}px`;
        image.style.top = `${state.y}px`;
        event.preventDefault();
    });
    zoom.addEventListener("input", () => render());
    reset.addEventListener("click", () => {
        zoom.value = "1";
        render(true);
    });
    window.addEventListener("resize", () => render(true));

    return {
        load,
        clear() {
            imageIsReady = false;
            editor.hidden = true;
            image.removeAttribute("src");
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrl = "";
            imageLoadPromise = Promise.resolve();
            state = { x: 0, y: 0, zoom: 1 };
            zoom.value = "1";
            viewport.classList.remove("is-dragging");
        },
        async getCroppedFile() {
            await imageLoadPromise;
            if (!imageIsReady) throw new Error("Tunggu sampai foto selesai dimuat sebelum menyimpan.");
            const frameWidth = viewport.clientWidth;
            const frameHeight = viewport.clientHeight;
            const outputSize = 900;
            const scaleX = outputSize / frameWidth;
            const scaleY = outputSize / frameHeight;
            const canvas = document.createElement("canvas");
            canvas.width = outputSize;
            canvas.height = outputSize;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Editor foto tidak dapat dibuka di browser ini.");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, outputSize, outputSize);
            context.imageSmoothingQuality = "high";
            context.drawImage(
                image,
                state.x * scaleX,
                state.y * scaleY,
                image.naturalWidth * baseScale * state.zoom * scaleX,
                image.naturalHeight * baseScale * state.zoom * scaleY
            );
            const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
            if (!blob) throw new Error("Hasil potongan foto gagal dibuat.");
            return new File([blob], fileName, { type: "image/jpeg", lastModified: Date.now() });
        }
    };
}

const memberGrid = document.querySelector("#memberGrid");
const memberForm = document.querySelector("#memberForm");
const memberStatus = document.querySelector("#memberStatus");
const memberFormTitle = document.querySelector("#memberFormTitle");
const memberEditId = document.querySelector("#memberEditId");
const memberNameInput = document.querySelector("#memberName");
const memberRoleInput = document.querySelector("#memberRole");
const memberImageInput = document.querySelector("#memberImage");
const memberImagePreview = document.querySelector("#memberImagePreview");
const memberImageNote = document.querySelector(".member-image-note");
const memberPhotoCropper = createSquarePhotoCropper({
    editor: document.querySelector("#memberCropEditor"),
    viewport: document.querySelector("#memberCropViewport"),
    image: document.querySelector("#memberCropImage"),
    zoom: document.querySelector("#memberCropZoom"),
    reset: document.querySelector("#memberCropReset"),
    fileName: "foto-anggota.jpg"
});
let memberPreviewObjectUrl = "";
let memberItems = [...memberGrid.querySelectorAll(".member-card")].map((card, index) => ({
    id: `member-${index + 1}`,
    name: card.querySelector("h3")?.textContent.trim() || "",
    role: card.querySelector("span")?.textContent.trim() || "",
    imageUrl: card.querySelector("img")?.getAttribute("src") || ""
}));

function createMemberPhotoPlaceholder(name) {
    const placeholder = document.createElement("div");
    placeholder.className = "member-photo-placeholder";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", `Foto ${name} belum tersedia`);
    placeholder.textContent = String(name || "ITC")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("") || "ITC";
    return placeholder;
}

function renderMembers() {
    memberGrid.replaceChildren(...memberItems.map(member => {
        const article = document.createElement("article");
        article.className = "member-card";

        if (member.imageUrl) {
            const image = document.createElement("img");
            image.src = member.imageUrl;
            image.alt = member.name;
            image.loading = "lazy";
            image.addEventListener("error", () => {
                image.replaceWith(createMemberPhotoPlaceholder(member.name));
            }, { once: true });
            article.append(image);
        } else {
            article.append(createMemberPhotoPlaceholder(member.name));
        }

        const name = document.createElement("h3");
        name.textContent = member.name;
        const role = document.createElement("span");
        role.textContent = member.role;
        article.append(name, role);

        if (isSuperAdmin) {
            const actions = document.createElement("div");
            actions.className = "member-actions admin-only super-admin-only";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.dataset.memberAction = "edit";
            editButton.dataset.memberId = member.id;
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.dataset.memberAction = "delete";
            deleteButton.dataset.memberId = member.id;
            deleteButton.textContent = "Hapus";

            actions.append(editButton, deleteButton);
            article.append(actions);
        }

        return article;
    }));
}

function resetMemberForm() {
    memberForm.reset();
    memberImageInput.setCustomValidity("");
    memberPhotoCropper.clear();
    if (memberPreviewObjectUrl) {
        URL.revokeObjectURL(memberPreviewObjectUrl);
        memberPreviewObjectUrl = "";
    }
    memberImagePreview.removeAttribute("src");
    memberImagePreview.hidden = true;
    memberImageNote.textContent =
        "Format JPG atau PNG, maksimal 10 MB. Geser foto dan atur zoom untuk memilih bagian yang disimpan.";
    memberEditId.value = "";
    memberFormTitle.textContent = "Tambah Anggota";
    memberForm.hidden = true;
}

document.querySelector("#addMemberBtn").addEventListener("click", () => {
    if (!isSuperAdmin) return;
    resetMemberForm();
    memberStatus.textContent = "";
    memberForm.hidden = false;
    memberNameInput.focus();
});

document.querySelector("#cancelMemberBtn").addEventListener("click", resetMemberForm);

memberGrid.addEventListener("click", event => {
    const actionButton = event.target.closest("[data-member-action]");
    if (!actionButton || !isSuperAdmin) {
        return;
    }
    const member = memberItems.find(item => item.id === actionButton.dataset.memberId);
    if (!member) {
        return;
    }

    if (actionButton.dataset.memberAction === "edit") {
        memberPhotoCropper.clear();
        if (memberPreviewObjectUrl) URL.revokeObjectURL(memberPreviewObjectUrl);
        memberPreviewObjectUrl = "";
        memberEditId.value = member.id;
        memberNameInput.value = member.name;
        memberRoleInput.value = member.role;
        memberImageInput.value = "";
        memberFormTitle.textContent = "Ubah Anggota";
        memberImageNote.textContent =
            "Pilih foto JPG atau PNG baru lalu geser dan atur zoom. Jika dikosongkan, foto lama tetap digunakan. Maksimal 10 MB.";
        if (member.imageUrl) {
            memberImagePreview.src = member.imageUrl;
            memberImagePreview.hidden = false;
        } else {
            memberImagePreview.removeAttribute("src");
            memberImagePreview.hidden = true;
        }
        memberForm.hidden = false;
        memberNameInput.focus();
        return;
    }

    if (actionButton.dataset.memberAction === "delete" &&
        window.confirm(`Hapus "${member.name}" dari daftar anggota?`)) {
        deleteMember(member);
    }
});

memberForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!isSuperAdmin || !memberForm.reportValidity()) {
        return;
    }

    let croppedMemberPhoto = null;
    if (memberImageInput.files[0]) {
        try {
            croppedMemberPhoto = await memberPhotoCropper.getCroppedFile();
        } catch (error) {
            memberStatus.textContent = `Foto anggota belum siap disimpan: ${error.message}`;
            return;
        }
    }

    const submitButton = memberForm.querySelector('button[type="submit"]');
    const formData = new FormData();
    formData.set("action", "save");
    formData.set("id", memberEditId.value);
    formData.set("name", memberNameInput.value.trim());
    formData.set("role", memberRoleInput.value.trim());
    if (croppedMemberPhoto) {
        formData.set("image", croppedMemberPhoto);
    }

    submitButton.disabled = true;
    memberStatus.textContent = "Menyimpan data anggota ke database...";
    try {
        const response = await fetch(getMembersEndpoint(), {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "X-CSRF-Token": adminCsrfToken
            },
            credentials: "same-origin",
            body: formData
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !result.member) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }

        const member = result.member;
        const existingIndex = memberItems.findIndex(item => item.id === member.id);
        if (existingIndex === -1) {
            memberItems.unshift(member);
        } else {
            memberItems[existingIndex] = member;
        }
        renderMembers();
        memberStatus.textContent = "Data anggota berhasil disimpan ke database.";
        resetMemberForm();
    } catch (error) {
        memberStatus.textContent = `Data anggota tidak dapat disimpan: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
});

memberImageInput.addEventListener("change", () => {
    memberImageInput.setCustomValidity("");
    const image = memberImageInput.files[0];
    if (!image) {
        return;
    }

    if (!["image/jpeg", "image/png"].includes(image.type)) {
        memberImageInput.setCustomValidity("Foto harus berformat JPG atau PNG.");
        memberImageInput.reportValidity();
        memberImageInput.value = "";
        memberPhotoCropper.clear();
        if (memberPreviewObjectUrl) URL.revokeObjectURL(memberPreviewObjectUrl);
        memberPreviewObjectUrl = "";
        memberImagePreview.removeAttribute("src");
        memberImagePreview.hidden = true;
        return;
    }
    const maximumPhotoSize = 10 * 1024 * 1024;
    if (image.size > maximumPhotoSize) {
        memberImageInput.setCustomValidity("Ukuran foto maksimal 10 MB.");
        memberImageInput.reportValidity();
        memberImageInput.value = "";
        memberPhotoCropper.clear();
        if (memberPreviewObjectUrl) URL.revokeObjectURL(memberPreviewObjectUrl);
        memberPreviewObjectUrl = "";
        memberImagePreview.removeAttribute("src");
        memberImagePreview.hidden = true;
        return;
    }

    if (memberPreviewObjectUrl) {
        URL.revokeObjectURL(memberPreviewObjectUrl);
        memberPreviewObjectUrl = "";
    }
    memberImagePreview.removeAttribute("src");
    memberImagePreview.hidden = true;
    memberPhotoCropper.load(image).catch(error => {
        memberStatus.textContent = `Foto anggota tidak dapat dimuat: ${error.message}`;
    });
});

async function loadMembers() {
    try {
        const response = await fetch(getMembersEndpoint(), {
            headers: { "Accept": "application/json" },
            credentials: "same-origin"
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !Array.isArray(result.members)) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        if (result.members.some(member =>
            !member ||
            typeof member.id !== "string" ||
            typeof member.name !== "string" ||
            typeof member.role !== "string" ||
            typeof member.imageUrl !== "string"
        )) {
            throw new Error("Format data anggota dari database tidak valid.");
        }

        memberItems = result.members;
        renderMembers();
        if (result.authenticated === true) {
            adminCsrfToken = result.csrfToken || "";
            isAdmin = true;
            setAdminSearchPlacement(true);
            setNavigationOpen(false);
            isSuperAdmin = result.role === "super_admin";
            document.body.classList.add("admin-mode");
            document.body.classList.toggle("super-admin-mode", isSuperAdmin);
            adminToolbar.hidden = false;
            setAdminSidebarOpen(false);
            document.querySelector("#adminLoginOpen").querySelector("span").textContent =
                result.adminName ? `${isSuperAdmin ? "Super Admin" : "Admin"}: ${result.adminName}` : "Admin aktif";
            showAdminMessage("Sesi admin aktif. Data anggota tersimpan di database.");
            renderMembers();
            document.dispatchEvent(new CustomEvent("itc-admin-mode-change"));
        }
    } catch (error) {
        memberStatus.textContent = `Data anggota tidak dapat dimuat dari database: ${error.message}`;
    }
}

async function deleteMember(member) {
    const formData = new FormData();
    formData.set("action", "delete");
    formData.set("id", member.id);
    memberStatus.textContent = "Menghapus anggota dari database...";
    try {
        const response = await fetch(getMembersEndpoint(), {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "X-CSRF-Token": adminCsrfToken
            },
            credentials: "same-origin",
            body: formData
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        memberItems = memberItems.filter(item => item.id !== member.id);
        renderMembers();
        memberStatus.textContent = "Anggota berhasil dihapus dari database.";
    } catch (error) {
        memberStatus.textContent = `Anggota tidak dapat dihapus: ${error.message}`;
    }
}

const alumniGrid = document.querySelector("#alumniGrid");
const alumniForm = document.querySelector("#alumniForm");
const alumniStatus = document.querySelector("#alumniStatus");
const alumniEmpty = document.querySelector("#emptyAlumni");
const alumniNameInput = document.querySelector("#alumniName");
const alumniGenerationInput = document.querySelector("#alumniGeneration");
const alumniPhotoInput = document.querySelector("#alumniPhoto");
const alumniPhotoPreview = document.querySelector("#alumniPhotoPreview");
const alumniPhotoNote = document.querySelector("#alumniPhotoNote");
const alumniPhotoCropper = createSquarePhotoCropper({
    editor: document.querySelector("#alumniCropEditor"),
    viewport: document.querySelector("#alumniCropViewport"),
    image: document.querySelector("#alumniCropImage"),
    zoom: document.querySelector("#alumniCropZoom"),
    reset: document.querySelector("#alumniCropReset"),
    fileName: "foto-alumni.jpg"
});
const alumniEditId = document.querySelector("#alumniEditId");
const alumniFormTitle = document.querySelector("#alumniFormTitle");
const alumniSaveButton = document.querySelector("#saveAlumniBtn");
let alumniItems = [];
let alumniPreviewObjectUrl = "";

function renderAlumni() {
    if (!alumniGrid) return;
    alumniGrid.replaceChildren(...alumniItems.map(alumni => {
        const article = document.createElement("article");
        article.className = "alumni-card";

        const image = document.createElement("img");
        image.src = alumni.imageUrl;
        image.alt = `Foto ${alumni.name}`;
        image.loading = "lazy";

        const name = document.createElement("h3");
        name.textContent = alumni.name;

        const generation = document.createElement("p");
        generation.className = "alumni-generation";
        generation.textContent = alumni.generation;

        article.append(image, name, generation);
        if (isSuperAdmin) {
            const actions = document.createElement("div");
            actions.className = "alumni-actions super-admin-only";
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.dataset.alumniAction = "edit";
            editButton.dataset.alumniId = alumni.id;
            editButton.textContent = "Edit";
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "alumni-delete";
            deleteButton.dataset.alumniAction = "delete";
            deleteButton.dataset.alumniId = alumni.id;
            deleteButton.textContent = "Hapus";
            actions.append(editButton, deleteButton);
            article.append(actions);
        }
        return article;
    }));
    if (alumniEmpty) alumniEmpty.hidden = alumniItems.length !== 0;
}

function setAlumniPreview(url, isTemporary = false) {
    if (alumniPreviewObjectUrl) URL.revokeObjectURL(alumniPreviewObjectUrl);
    alumniPreviewObjectUrl = isTemporary ? url : "";
    alumniPhotoPreview.src = url;
    alumniPhotoPreview.hidden = !url;
}

function resetAlumniForm() {
    alumniForm.reset();
    alumniPhotoCropper.clear();
    alumniEditId.value = "";
    alumniFormTitle.textContent = "Tambah Alumni";
    alumniPhotoInput.required = true;
    alumniPhotoNote.textContent = "Foto wajib diisi saat menambah alumni. JPG/PNG maksimal 10 MB; geser foto dan atur zoom.";
    setAlumniPreview("");
    alumniForm.hidden = true;
}

function editAlumni(alumni) {
    alumniPhotoCropper.clear();
    alumniEditId.value = alumni.id;
    alumniNameInput.value = alumni.name;
    alumniGenerationInput.value = alumni.generation;
    alumniPhotoInput.value = "";
    alumniPhotoInput.required = false;
    alumniPhotoNote.textContent = "Geser foto baru dan atur zoom. Kosongkan pilihan jika foto saat ini tetap digunakan. JPG/PNG maksimal 10 MB.";
    alumniFormTitle.textContent = "Ubah Data Alumni";
    setAlumniPreview(alumni.imageUrl);
    alumniStatus.textContent = "";
    alumniForm.hidden = false;
    alumniForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function loadAlumni() {
    try {
        const response = await fetch(getAlumniEndpoint(), {
            headers: { Accept: "application/json" },
            credentials: "same-origin"
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        alumniItems = result.data;
        renderAlumni();
    } catch (error) {
        alumniEmpty.hidden = false;
        alumniEmpty.textContent = `Data alumni belum dapat dimuat: ${error.message}`;
        console.error("Data alumni gagal dimuat:", error);
    }
}

document.querySelector("#addAlumniBtn")?.addEventListener("click", () => {
    if (!isSuperAdmin) return;
    resetAlumniForm();
    alumniStatus.textContent = "";
    alumniForm.hidden = false;
    alumniForm.scrollIntoView({ behavior: "smooth", block: "center" });
    alumniNameInput.focus();
});

document.querySelector("#cancelAlumniBtn")?.addEventListener("click", resetAlumniForm);

alumniPhotoInput?.addEventListener("change", () => {
    const file = alumniPhotoInput.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024) {
        alumniPhotoInput.value = "";
        alumniPhotoCropper.clear();
        setAlumniPreview("");
        alumniStatus.textContent = "Pilih foto JPG/PNG dengan ukuran maksimal 10 MB.";
        return;
    }
    setAlumniPreview("");
    alumniPhotoCropper.load(file).catch(error => {
        alumniStatus.textContent = `Foto alumni tidak dapat dimuat: ${error.message}`;
    });
});

alumniForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!isSuperAdmin || !adminCsrfToken) {
        alumniStatus.textContent = "Hanya super admin yang dapat mengelola alumni.";
        return;
    }
    const formData = new FormData();
    formData.set("action", "save");
    formData.set("id", alumniEditId.value);
    formData.set("name", alumniNameInput.value.trim());
    formData.set("generation", alumniGenerationInput.value.trim());
    if (alumniPhotoInput.files[0]) {
        try {
            formData.set("photo", await alumniPhotoCropper.getCroppedFile());
        } catch (error) {
            alumniStatus.textContent = `Foto alumni belum siap disimpan: ${error.message}`;
            return;
        }
    }
    alumniSaveButton.disabled = true;
    alumniStatus.textContent = "Menyimpan data alumni...";
    try {
        const response = await fetch(getAlumniEndpoint(), {
            method: "POST",
            headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
            credentials: "same-origin",
            body: formData
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        const saved = result.data;
        const existingIndex = alumniItems.findIndex(item => item.id === saved.id);
        if (existingIndex >= 0) alumniItems[existingIndex] = saved;
        else alumniItems.unshift(saved);
        renderAlumni();
        resetAlumniForm();
        alumniStatus.textContent = result.message || "Data alumni berhasil disimpan.";
    } catch (error) {
        alumniStatus.textContent = `Data alumni gagal disimpan: ${error.message}`;
    } finally {
        alumniSaveButton.disabled = false;
    }
});

alumniGrid?.addEventListener("click", async event => {
    const button = event.target.closest("[data-alumni-action]");
    if (!button || !isSuperAdmin) return;
    const alumni = alumniItems.find(item => item.id === button.dataset.alumniId);
    if (!alumni) return;
    if (button.dataset.alumniAction === "edit") {
        editAlumni(alumni);
        return;
    }
    if (button.dataset.alumniAction !== "delete" || !window.confirm(`Hapus data alumni ${alumni.name}?`)) return;
    const formData = new FormData();
    formData.set("action", "delete");
    formData.set("id", alumni.id);
    alumniStatus.textContent = "Menghapus data alumni...";
    try {
        const response = await fetch(getAlumniEndpoint(), {
            method: "POST",
            headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
            credentials: "same-origin",
            body: formData
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(result.message || `Server memberikan respons ${response.status}.`);
        }
        alumniItems = alumniItems.filter(item => item.id !== alumni.id);
        renderAlumni();
        alumniStatus.textContent = result.message || "Data alumni berhasil dihapus.";
    } catch (error) {
        alumniStatus.textContent = `Data alumni gagal dihapus: ${error.message}`;
    }
});

document.addEventListener("itc-admin-mode-change", () => {
    if (!isSuperAdmin && alumniForm && !alumniForm.hidden) resetAlumniForm();
    renderAlumni();
});

renderMembers();
loadMembers();
renderAlumni();
loadAlumni();

checkAdminSession();


// ======================================================
// PENDAFTARAN ANGGOTA - TERHUBUNG KE DATABASE MYSQL
// ======================================================

const registrationForm = document.querySelector("#registrationForm");
const registrationMessage = document.querySelector("#registrationMessage");
const registrationWindowPanel = document.querySelector("#registrationWindowPanel");
const registrationWindowStatus = document.querySelector("#registrationWindowStatus");
const toggleRegistrationWindowButton = document.querySelector("#toggleRegistrationWindowBtn");
const registrationWindowAdminMessage = document.querySelector("#registrationWindowAdminMessage");
const registrationsWorkspacePanel = document.querySelector("#registrationsWorkspacePanel");
const registrationsWorkspaceTableBody = document.querySelector("#registrationsWorkspaceTableBody");
const registrationsWorkspaceStatus = document.querySelector("#registrationsWorkspaceStatus");
const refreshRegistrationsWorkspaceBtn = document.querySelector("#refreshRegistrationsWorkspaceBtn");

function closeRegistrationWindowView() {
    if (registrationWindowPanel) registrationWindowPanel.hidden = true;
    document.querySelector("#manageRegistrationWindowBtn")?.classList.remove("active");
}

function closeRegistrationsWorkspaceView() {
    if (registrationsWorkspacePanel) registrationsWorkspacePanel.hidden = true;
    document.querySelector("#openRegistrationsWorkspaceBtn")?.classList.remove("active");
}
let registrationIsOpen = null;

// Mengambil endpoint API pendaftaran
function getRegistrationsEndpoint() {
    const endpoint = adminLoginForm?.dataset.registrationsEndpoint?.trim();

    if (!endpoint) {
        throw new Error("Alamat API pendaftaran belum diatur.");
    }

    return endpoint;
}

function renderRegistrationWindowState() {
    const submitButton = registrationForm?.querySelector('button[type="submit"]');
    const isOpen = registrationIsOpen === true;
    if (registrationWindowStatus) {
        registrationWindowStatus.textContent = registrationIsOpen === null
            ? "Status belum tersedia"
            : (isOpen ? "Dibuka" : "Ditutup");
        registrationWindowStatus.dataset.status = registrationIsOpen === null ? "unknown" : (isOpen ? "open" : "closed");
    }
    if (toggleRegistrationWindowButton) {
        toggleRegistrationWindowButton.textContent = registrationIsOpen === null
            ? "Muat ulang status"
            : (isOpen ? "Tutup pendaftaran" : "Buka pendaftaran");
        toggleRegistrationWindowButton.disabled = !isAdmin || !adminCsrfToken;
    }
    if (registrationForm) {
        registrationForm.classList.toggle("registration-form-closed", !isOpen);
        registrationForm.querySelectorAll("input, select, textarea").forEach(field => {
            field.disabled = !isOpen;
        });
    }
    if (submitButton) submitButton.disabled = !isOpen;
    if (registrationIsOpen === null) {
        setRegistrationMessage("Status pendaftaran belum dapat dimuat.", "error");
    } else if (!isOpen) {
        setRegistrationMessage("Pendaftaran anggota sedang ditutup.", "closed");
        registrationMessage?.classList.add("registration-window-message");
    } else if (registrationMessage?.classList.contains("registration-window-message") ||
        registrationMessage?.textContent === "Status pendaftaran belum dapat dimuat.") {
        setRegistrationMessage("Pendaftaran sedang dibuka.", "success");
        registrationMessage?.classList.add("registration-window-message");
    }
}

async function loadRegistrationWindow() {
    try {
        const endpoint = new URL(getRegistrationsEndpoint(), window.location.href);
        endpoint.searchParams.set("public_status", "1");
        const response = await fetch(endpoint, {
            headers: { Accept: "application/json" },
            credentials: "same-origin",
            cache: "no-store"
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || typeof result.data?.is_open !== "boolean") {
            throw new Error("Status pendaftaran belum dapat dimuat.");
        }
        registrationIsOpen = result.data.is_open;
        renderRegistrationWindowState();
        if (registrationWindowAdminMessage) {
            registrationWindowAdminMessage.textContent = `Pendaftaran saat ini ${registrationIsOpen ? "dibuka" : "ditutup"}.`;
        }
    } catch (_) {
        registrationIsOpen = null;
        renderRegistrationWindowState();
        if (registrationWindowAdminMessage) {
            registrationWindowAdminMessage.textContent = "Status pendaftaran belum dapat dimuat. Coba lagi.";
        }
    }
}

// Menampilkan pesan pendaftaran
function setRegistrationMessage(message, type = "") {
    if (!registrationMessage) {
        return;
    }

    registrationMessage.textContent = message;
    registrationMessage.className = "registration-message";

    if (type) {
        registrationMessage.classList.add(type);
    }
}

// Mengirim formulir pendaftaran
registrationForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (registrationIsOpen !== true) {
        setRegistrationMessage("Pendaftaran sedang ditutup atau statusnya belum tersedia.", "closed");
        return;
    }

    if (!registrationForm.reportValidity()) {
        return;
    }

    const submitButton = registrationForm.querySelector(
        'button[type="submit"]'
    );

    const originalButtonContent = submitButton.innerHTML;

    // Mengambil seluruh data formulir
    const formData = new FormData(registrationForm);

    // Memberitahukan API bahwa ini pendaftaran publik
    formData.set("action", "register");

    submitButton.disabled = true;

    submitButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    setRegistrationMessage(
        "Mengirim data pendaftaran...",
        "loading"
    );

    try {
        const response = await fetch(getRegistrationsEndpoint(), {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            credentials: "same-origin",
            body: formData
        });

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.toLowerCase().includes("application/json")) {
            throw new Error(
                `Server tidak memberikan respons JSON (HTTP ${response.status}).`
            );
        }

        const result = await response.json();

        if (!response.ok || result.success !== true) {
            throw new Error(
                result.message ||
                `Pendaftaran gagal. Server memberikan respons ${response.status}.`
            );
        }

        // Membersihkan formulir setelah berhasil
        registrationForm.reset();

        setRegistrationMessage(
            result.message ||
            "Pendaftaran berhasil dikirim. Terima kasih telah mendaftar menjadi anggota ITC!",
            "success"
        );

    } catch (error) {
        console.error("Pendaftaran gagal:", error);

        setRegistrationMessage(
            `Pendaftaran tidak berhasil: ${error.message}`,
            "error"
        );

    } finally {
        submitButton.innerHTML = originalButtonContent;
        renderRegistrationWindowState();
    }
});

document.querySelector("#manageRegistrationWindowBtn")?.addEventListener("click", () => {
    if (!isAdmin || !registrationWindowPanel) return;
    closeHomeBackgroundWorkspaceView();
    closePageContentEditorView();
    closeAdminAccountsWorkspaceView();
    closeRegistrationsWorkspaceView();
    [homeBackgroundAdminPanel, adminAccountsPanel].forEach(panel => {
        if (panel) panel.hidden = true;
    });
    closeSystemStatusWorkspaceView();
    registrationWindowPanel.hidden = false;
    document.querySelectorAll(".admin-sidebar-link").forEach(link => link.classList.toggle("active", link.id === "manageRegistrationWindowBtn"));
    loadRegistrationWindow();
});

document.querySelector("#closeRegistrationWindowBtn")?.addEventListener("click", () => {
    closeRegistrationWindowView();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && registrationWindowPanel && !registrationWindowPanel.hidden) {
        closeRegistrationWindowView();
        const menuButton = document.querySelector("#manageRegistrationWindowBtn");
        menuButton?.focus();
    }
});

document.querySelector("#openRegistrationsWorkspaceBtn")?.addEventListener("click", () => {
    if (!isAdmin || !registrationsWorkspacePanel) return;
    closeHomeBackgroundWorkspaceView();
    closePageContentEditorView();
    closeAdminAccountsWorkspaceView();
    closeRegistrationWindowView();
    [homeBackgroundAdminPanel, adminAccountsPanel].forEach(panel => {
        if (panel) panel.hidden = true;
    });
    closeSystemStatusWorkspaceView();
    registrationsWorkspacePanel.hidden = false;
    document.querySelectorAll(".admin-sidebar-link").forEach(link => link.classList.toggle("active", link.id === "openRegistrationsWorkspaceBtn"));
    loadRegistrations();
});

document.querySelector("#closeRegistrationsWorkspaceBtn")?.addEventListener("click", closeRegistrationsWorkspaceView);
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && registrationsWorkspacePanel && !registrationsWorkspacePanel.hidden) {
        closeRegistrationsWorkspaceView();
        document.querySelector("#openRegistrationsWorkspaceBtn")?.focus();
    }
});

toggleRegistrationWindowButton?.addEventListener("click", async () => {
    if (!isAdmin || !adminCsrfToken) return;
    if (registrationIsOpen === null) {
        await loadRegistrationWindow();
        return;
    }
    const nextIsOpen = !registrationIsOpen;
    const formData = new FormData();
    formData.set("action", "set_registration_window");
    formData.set("is_open", nextIsOpen ? "1" : "0");
    toggleRegistrationWindowButton.disabled = true;
    if (registrationWindowAdminMessage) registrationWindowAdminMessage.textContent = "Menyimpan pengaturan pendaftaran...";
    try {
        const response = await fetch(getRegistrationsEndpoint(), {
            method: "POST",
            headers: { Accept: "application/json", "X-CSRF-Token": adminCsrfToken },
            credentials: "same-origin",
            body: formData
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || typeof result.data?.is_open !== "boolean") {
            throw new Error(result.message || "Pengaturan pendaftaran gagal disimpan.");
        }
        registrationIsOpen = result.data.is_open;
        renderRegistrationWindowState();
        if (registrationWindowAdminMessage) registrationWindowAdminMessage.textContent = result.message;
    } catch (error) {
        if (registrationWindowAdminMessage) registrationWindowAdminMessage.textContent = error.message || "Pengaturan pendaftaran gagal disimpan.";
        toggleRegistrationWindowButton.disabled = false;
    }
});

renderRegistrationWindowState();
loadRegistrationWindow();

// Daftar pendaftar hanya diminta dan dirender ketika sesi admin aktif.
const registrationsTableBody = document.querySelector("#registrationsTableBody");
const registrationsAdminStatus = document.querySelector("#registrationsAdminStatus");
const refreshRegistrationsBtn = document.querySelector("#refreshRegistrationsBtn");
const registrationsTableBodies = [registrationsTableBody, registrationsWorkspaceTableBody].filter(Boolean);
const registrationsStatusNodes = [registrationsAdminStatus, registrationsWorkspaceStatus].filter(Boolean);

function setRegistrationsAdminStatus(message) {
    registrationsStatusNodes.forEach(node => { node.textContent = message; });
}

function appendRegistrationCell(row, label, value) {
    const cell = document.createElement("td");
    cell.dataset.label = label;
    cell.textContent = value == null || value === "" ? "—" : String(value);
    row.appendChild(cell);
}

async function loadRegistrations() {
    if (!isAdmin || registrationsTableBodies.length === 0) {
        return;
    }

    setRegistrationsAdminStatus("Memuat data pendaftar...");
    [refreshRegistrationsBtn, refreshRegistrationsWorkspaceBtn].filter(Boolean).forEach(button => { button.disabled = true; });

    try {
        const response = await fetch(getRegistrationsEndpoint(), {
            method: "GET",
            headers: { "Accept": "application/json" },
            credentials: "same-origin",
            cache: "no-store"
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(result.message || `Gagal memuat data (HTTP ${response.status}).`);
        }

        const registrations = Array.isArray(result.data) ? result.data : [];
        registrationsTableBodies.forEach(body => body.replaceChildren());

        if (registrations.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 6;
            cell.className = "registrations-empty";
            cell.textContent = "Belum ada pendaftaran yang masuk.";
            row.appendChild(cell);
            registrationsTableBodies.forEach(body => body.appendChild(row.cloneNode(true)));
            setRegistrationsAdminStatus("0 pendaftar.");
            return;
        }

        registrations.forEach(registration => {
            const row = document.createElement("tr");
            appendRegistrationCell(row, "Nama", registration.name);
            appendRegistrationCell(row, "Kelas", registration.class_name);
            appendRegistrationCell(
                row,
                "Nomor Telepon",
                registration.phone || "Belum tersedia (pendaftar lama)"
            );
            appendRegistrationCell(row, "Bidang minat", registration.interest);
            appendRegistrationCell(row, "Alasan bergabung", registration.motivation);

            let createdAt = registration.created_at;
            if (createdAt) {
                const date = new Date(String(createdAt).replace(" ", "T"));
                createdAt = Number.isNaN(date.getTime())
                    ? String(registration.created_at)
                    : date.toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short"
                    });
            }
            appendRegistrationCell(row, "Tanggal daftar", createdAt);
            registrationsTableBodies.forEach(body => body.appendChild(row.cloneNode(true)));
        });

        setRegistrationsAdminStatus(`${registrations.length} pendaftar.`);
    } catch (error) {
        registrationsTableBodies.forEach(body => body.replaceChildren());
        setRegistrationsAdminStatus(`Data pendaftar gagal dimuat: ${error.message}`);
    } finally {
        [refreshRegistrationsBtn, refreshRegistrationsWorkspaceBtn].filter(Boolean).forEach(button => { button.disabled = false; });
    }
}

refreshRegistrationsBtn?.addEventListener("click", loadRegistrations);
refreshRegistrationsWorkspaceBtn?.addEventListener("click", loadRegistrations);
document.addEventListener("itc-admin-mode-change", () => {
    if (isAdmin) {
        loadRegistrations();
        if (registrationWindowPanel && !registrationWindowPanel.hidden) loadRegistrationWindow();
        if (registrationsWorkspacePanel && !registrationsWorkspacePanel.hidden) loadRegistrations();
    } else {
        if (registrationWindowPanel) registrationWindowPanel.hidden = true;
        closeRegistrationsWorkspaceView();
        registrationsTableBodies.forEach(body => body.replaceChildren());
        setRegistrationsAdminStatus("");
    }
});

// Cek sesi admin dipanggil sebelumnya; muat daftar bila pemeriksaan selesai lebih dulu.
if (isAdmin) {
    loadRegistrations();
}
