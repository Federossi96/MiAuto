function saveSearch() {
    const filters = {
        marca: $('#marca').val(),
        precioMin: $('#precio-min').val(),
        precioMax: $('#precio-max').val(),
        kmMax: $('#km-max').val(),
        year: $('#year').val(),
        sort: $('#sort').val()
    };
    let searches = JSON.parse(localStorage.getItem('savedSearches')) || [];
    searches.unshift(filters); // Agregar al inicio
    if (searches.length > 5) searches.pop(); // Limitar a 5
    localStorage.setItem('savedSearches', JSON.stringify(searches));
}

function loadSavedSearches() {
    const searches = JSON.parse(localStorage.getItem('savedSearches')) || [];
    if (searches.length === 0) {
        $('#search-list').html('<p>No tienes búsquedas guardadas.</p>');
        return;
    }

    $('#search-list').empty();
    searches.forEach((search, index) => {
        const searchItem = `
            <div class="search-item">
                <h3>Búsqueda ${index + 1}</h3>
                <p><strong>Marca:</strong> ${search.marca || 'Cualquiera'}</p>
                <p><strong>Precio:</strong> ${search.precioMin || 0} - ${search.precioMax || '∞'} €</p>
                <p><strong>Km:</strong> Hasta ${search.kmMax || '∞'}</p>
                <p><strong>Año:</strong> Desde ${search.year || 0}</p>
                <button class="btn btn-primary apply-search" data-index="${index}">Aplicar</button>
            </div>
        `;
        $('#search-list').append(searchItem);
    });

    $('.apply-search').click(function () {
        const index = $(this).data('index');
        const search = searches[index];
        $('#marca').val(search.marca);
        $('#precio-min').val(search.precioMin);
        $('#precio-max').val(search.precioMax);
        $('#km-max').val(search.kmMax);
        $('#year').val(search.year);
        $('#sort').val(search.sort);
        window.location.href = 'coches.html';
    });
}