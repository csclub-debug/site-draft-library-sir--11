document.addEventListener('DOMContentLoaded', function(){
    // ===================================================
    // 1. FIXED: Active nav highlight (Using your simple, effective logic)
    // ===================================================

    // Get the final segment of the URL path (the filename), or default to 'index.html' for root.
    const currentFileName = location.pathname.split('/').pop() || 'index.html';

    // Find all navigation links in both navbar and drawer
    document.querySelectorAll('.nav a, .drawer-menu a').forEach(a => {
        const linkHref = a.getAttribute('href');
        
        // 1. Always remove 'active' class first
        a.classList.remove('active');

        // 2. Activate if the link's href matches the current file name exactly
        if (linkHref === currentFileName) {
            a.classList.add('active');
        }
    });


    // ===================================================
    // 2. Existing Scripts (Drawer, Accordion, etc.)
    // ===================================================

    // Accordion for announcements (Updated to close others and toggle active class/icon)
    document.querySelectorAll('.acc-header').forEach(h=>{
        h.addEventListener('click', ()=>{
            const p = h.parentElement;
            const body = p.querySelector('.acc-body');
            const bodySpan = h.querySelector('span');
            const isOpen = body.style.display === 'block';
            
            // Close all other open items and reset icons
            document.querySelectorAll('.acc-item').forEach(item => {
                item.querySelector('.acc-body').style.display='none';
                item.classList.remove('active'); // Remove active class from all
                // Assuming your '+' is inside the span in the header:
                const span = item.querySelector('.acc-header span');
                if (span) span.textContent = '+';
            });
            
            // Toggle the clicked item
            if(!isOpen) {
                body.style.display = 'block';
                p.classList.add('active'); // Add active class to item wrapper
                if (bodySpan) bodySpan.textContent = '−'; // Change icon to minus
            }
        });
    });

    // Drawer toggle (mobile)
    const hamburger = document.querySelector('.hamburger');
    const drawer = document.querySelector('.drawer');
    const backdrop = document.querySelector('.drawer-backdrop');
    if(hamburger && drawer && backdrop){
        const toggleDrawer = (open) => {
            if (open) {
                drawer.classList.add('open'); 
                backdrop.classList.add('open'); 
                hamburger.classList.add('open'); // Toggle hamburger icon class
                drawer.setAttribute('aria-hidden','false'); 
                backdrop.setAttribute('aria-hidden','false');
                document.body.style.overflow = 'hidden'; // Disable background scroll
            } else {
                drawer.classList.remove('open'); 
                backdrop.classList.remove('open'); 
                hamburger.classList.remove('open'); // Toggle hamburger icon class
                drawer.setAttribute('aria-hidden','true'); 
                backdrop.setAttribute('aria-hidden','true');
                document.body.style.overflow = ''; // Enable background scroll
            }
        };

        // This listener is for the hamburger button
        hamburger.addEventListener('click', ()=>{ 
            const isOpen = drawer.classList.contains('open');
            toggleDrawer(!isOpen);
        });
        
        // This listener is for the backdrop click
        backdrop.addEventListener('click', ()=>{ toggleDrawer(false); });
        
        // Override the default link action to ensure the drawer closes smoothly.
        document.querySelectorAll('.drawer-menu a').forEach(a => {
            a.addEventListener('click', (e) => { 
                e.preventDefault(); // Stop the default navigation/reload immediately
                
                // 1. Start the closing animation
                toggleDrawer(false); 

                // 2. Wait for the animation (0.28s) and then navigate/reload
                setTimeout(() => {
                    window.location.href = a.href;
                }, 300); 
            });
        });

        document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ toggleDrawer(false); }});
    }

    // Demo search button (homepage)
    const searchBtn = document.getElementById('searchBtn');
    const searchBox = document.getElementById('searchBox');
    if(searchBtn && searchBox){
        searchBtn.addEventListener('click', ()=>{
            alert('Search is demo-only. Replace with OPAC integration.');
        });
    }

    // Books search on books page
    const booksSearch = document.getElementById('booksSearch');
    if(booksSearch){
        booksSearch.addEventListener('input', function(e){
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('#booksTable tbody tr').forEach(tr=>{
                tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    // Email Fallback
    document.querySelectorAll('a[href^="mailto:"]').forEach(emailLink => {
        emailLink.addEventListener('click', (e) => {
            const email = emailLink.getAttribute('href').replace('mailto:', '');
            setTimeout(() => {
                if (e.defaultPrevented === false) { 
                    alert(`If your email client did not launch, you can manually use this address: ${email}`);
                }
            }, 500);
        });
    });
});

// Dynamic content loader: fetch /content/data.json and render on specific pages
async function loadSiteData(){
    try {
        const res = await fetch('/content/data.json');
        if(!res.ok) return;
        const data = await res.json();
        
        // Helper function for XSS protection
        function escapeHtml(str){ if(!str) return ''; return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function escapeAttr(str){ if(!str) return ''; return str.replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

        // Announcements page
        const annContainer = document.getElementById('announcements-container');
        if(annContainer && data.announcements){
            annContainer.innerHTML = '';
            data.announcements.forEach(a=>{
                const item = document.createElement('div');
                item.className = 'acc-item';
                item.innerHTML = `<div class="acc-header">${escapeHtml(a.title)} <span style="color:var(--muted)">+</span></div><div class="acc-body">${escapeHtml(a.body)}</div>`;
                annContainer.appendChild(item);
            });
            // reattach accordion toggles (re-attaching this logic is important!)
            document.querySelectorAll('#announcements-container .acc-header').forEach(h=>{
                h.addEventListener('click', ()=>{
                    const body = h.parentElement.querySelector('.acc-body');
                    const bodySpan = h.querySelector('span');
                    const isOpen = body.style.display === 'block';

                    document.querySelectorAll('#announcements-container .acc-item').forEach(item => {
                        item.querySelector('.acc-body').style.display='none';
                        item.classList.remove('active');
                        const span = item.querySelector('.acc-header span');
                        if (span) span.textContent = '+';
                    });
                    
                    if(!isOpen) {
                        body.style.display = 'block';
                        h.parentElement.classList.add('active');
                        if (bodySpan) bodySpan.textContent = '−';
                    }
                });
            });
        }

        // Staff page
        const staffGrid = document.getElementById('staff-grid');
        if(staffGrid && data.staff){
            staffGrid.innerHTML = '';
            data.staff.forEach(s=>{
                const card = document.createElement('div');
                card.className = 'staff-card';
                card.innerHTML = `<div style="font-weight:700">${escapeHtml(s.name)}</div><div style="color:var(--muted)">${escapeHtml(s.role)}</div>`;
                staffGrid.appendChild(card);
            });
        }

        // Books page
        const booksList = document.getElementById('books-list');
        if(booksList && data.books){
            booksList.innerHTML = '<div class="cards"></div>';
            const container = booksList.querySelector('.cards');
            data.books.forEach(b=>{
                const c = document.createElement('div');
                c.className = 'card';
                c.innerHTML = `<div style="font-weight:700">${escapeHtml(b.title)}</div><div style="color:var(--muted)">${escapeHtml(b.author||'')}</div>`;
                container.appendChild(c);
            });
        }

        // E-resources page
        const erList = document.getElementById('eresources-list');
        if(erList && data.eresources){
            erList.innerHTML = '';
            data.eresources.forEach(r=>{
                const li = document.createElement('div');
                li.className='card';
                li.innerHTML = `<div style="font-weight:700"><a href="${escapeAttr(r.link)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a></div><div style="color:var(--muted)">${escapeHtml(r.description||'')}</div>`;
                erList.appendChild(li);
            });
        }

    } catch(err){
        console.error('Failed to load site data', err);
    }
}

document.addEventListener('DOMContentLoaded', function(){
    // call loader after initial scripts
    loadSiteData();
});