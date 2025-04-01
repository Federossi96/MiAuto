$(document).ready(function () {
    let currentPage = 1;
    const itemsPerPage = 6;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
    updateFavCount();
    updateCompareCount();

    if (window.location.pathname.includes('coches.html')) {
        loadCars();
        setupFilters();
        loadLastSearch();
    }

    if (window.location.pathname.includes('detalle.html')) {
        loadCarDetails();
    }

    if (window.location.pathname.includes('index.html')) {
        loadFeaturedCars();
        animateStats();
    }

    if (window.location.pathname.includes('vender.html')) {
        setupSellForm();
    }

    $('.menu-toggle').click(function () {
        $('.nav-menu').toggleClass('active');
    });

    $(document).on('click', '.add-fav', function () {
        const carId = $(this).data('id').toString();
        toggleFavorite(carId);
    });

    $(document).on('click', '.compare-btn', function () {
        const carId = $(this).data('id').toString();
        toggleCompare(carId);
    });

    $(document).on('click', '.quick-view', function () {
        const carId = $(this).data('id');
        showQuickView(carId);
    });

    $(document).on('click', '.share-btn', function () {
        const carId = $(this).data('id');
        shareCar(carId);
    });

    $(document).on('click', '.contact-btn', function () {
        alert('Contactar vendedor');
    });

    $('#calc-finance').click(function () {
        const amount = parseFloat($('#finance-amount').val()) || 0;
        const term = parseInt($('#finance-term').val()) || 12;
        const monthly = (amount / term).toFixed(2);
        $('#finance-result').text(`Resultado: ${monthly} €/mes`);
    });

    $('#toggle-favorites').click(function (e) {
        e.preventDefault();
        displayFavorites();
    });

    $(document).on('click', '.close-modal', function () {
        $('#quick-view-modal').hide();
    });

    $(document).on('click', '.thumb', function () {
        $('.thumb').removeClass('active');
        $(this).addClass('active');
        $('#main-img').attr('src', $(this).data('img'));
    });


    $('#save-search').click(function () {
        saveSearch();
        alert('Búsqueda guardada!');
    });

    function animateStats() {
        $('.stat-item span').each(function () {
            const target = parseInt($(this).data('target'));
            $(this).animate({ count: target }, {
                duration: 2000,
                step: function (now) {
                    $(this).text(Math.ceil(now));
                }
            });
        });
    }

    function setupFilters() {
        $('#search-form').submit(function (e) {
            e.preventDefault();
            currentPage = 1;
            loadCars();
            saveSearch();
        });

        $('#clear-filters').click(function () {
            $('#search-form')[0].reset();
            currentPage = 1;
            loadCars();
        });

        $('#next-page').click(function () {
            currentPage++;
            loadCars();
        });

        $('#prev-page').click(function () {
            if (currentPage > 1) {
                currentPage--;
                loadCars();
            }
        });

        $('.filter-buttons button').click(function () {
            const category = $(this).data('category');
            $('.car-item').hide();
            if (category === 'all') {
                $('.car-item').show();
            } else {
                $(`.car-item[data-category="${category}"]`).show();
            }
        });

        $('#marca').on('input', function () {
            const query = $(this).val();
            if (query.length > 1) {
                suggestBrands(query);
            }
        });
    }

    function loadCars() {
        const filters = {
            marca: $('#marca').val() || '',
            precioMin: parseInt($('#precio-min').val()) || 0,
            precioMax: parseInt($('#precio-max').val()) || Infinity,
            kmMax: parseInt($('#km-max').val()) || Infinity,
            year: parseInt($('#year').val()) || 0,
            sort: $('#sort').val() || '',
            page: currentPage,
            limit: itemsPerPage
        };

        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: filters,
            dataType: 'json',
            beforeSend: function () {
                $('#car-list').html('<p class="loading">Cargando...</p>');
            },
            success: function (data) {
                if (data.error) {
                    $('#car-list').html('<p>Error del servidor: ' + data.error + '</p>');
                } else if (!data.cars || data.cars.length === 0) {
                    $('#car-list').html('<p>No se encontraron resultados.</p>');
                } else {
                    displayCars(data.cars);
                    updatePagination(data.total);
                }
            },
            error: function (xhr, status, error) {
                $('#car-list').html('<p>Error en la solicitud: ' + status + ' - ' + error + '. Verifica que api.php esté en el directorio correcto y el servidor esté activo.</p>');
            }
        });
    }

    function displayCars(cars) {
        $('#car-list').empty();
        cars.forEach(car => {
            const isFav = favorites.includes(car.id.toString());
            const isCompared = compareList.includes(car.id.toString());
            const imageSrc = car.imagen && car.imagen !== '' ? car.imagen : `https://placehold.co/400x300?text=${encodeURIComponent(car.marca + ' ' + car.modelo)}`;
            const carItem = `
                <div class="car-item" data-category="${car.combustible === 'Diésel' ? 'sedan' : 'suv'}">
                    <div class="car-image">
                        <img src="${imageSrc}" alt="${car.marca} ${car.modelo}" onerror="this.src='https://placehold.co/400x300?text=Imagen+no+disponible'">
                        ${car.id % 2 === 0 ? '<span class="offer-tag">Oferta</span>' : ''}
                    </div>
                    <div class="car-info">
                        <h3>${car.marca} ${car.modelo} - ${car.version}</h3>
                        <p><strong>Año:</strong> ${car.anio} | <strong>Km:</strong> ${car.kilometros.toLocaleString('es-ES')}</p>
                        <p><strong>Combustible:</strong> ${car.combustible} | <strong>Motor:</strong> ${car.motor} | <strong>Potencia:</strong> ${car.potencia} CV</p>
                        <p><strong>Transmisión:</strong> ${car.transmision} | <strong>Color:</strong> ${car.color}</p>
                        <p class="price">${parseFloat(car.precio).toLocaleString('es-ES')} €</p>
                        <div class="actions">
                            <a href="detalle.html?id=${car.id}" class="btn btn-primary">Ver detalles</a>
                            <button class="btn btn-secondary add-fav" data-id="${car.id}">${isFav ? 'Quitar favorito' : 'Favorito'}</button>
                            <button class="btn btn-secondary compare-btn" data-id="${car.id}">${isCompared ? 'Quitar comparar' : 'Comparar'}</button>
                            <button class="btn btn-secondary quick-view" data-id="${car.id}">Vista rápida</button>
                            <button class="btn btn-secondary share-btn" data-id="${car.id}"><i class="material-icons">share</i></button>
                            <button class="btn btn-secondary contact-btn">Contactar</button>
                        </div>
                    </div>
                </div>
            `;
            $('#car-list').append(carItem);
        });
    }

    function loadFeaturedCars() {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: { page: 1, limit: 3 },
            dataType: 'json',
            success: function (data) {
                if (data.cars) {
                    displayFeaturedCars(data.cars);
                }
            },
            error: function () {
                $('#featured-cars').html('<p>Error al cargar destacados.</p>');
            }
        });
    }

    function displayFeaturedCars(cars) {
        $('#featured-cars').empty();
        cars.forEach(car => {
            const imageSrc = car.imagen && car.imagen !== '' ? car.imagen : `https://placehold.co/400x300?text=${encodeURIComponent(car.marca + ' ' + car.modelo)}`;
            const carItem = `
                <div class="car-item">
                    <div class="car-image">
                        <img src="${imageSrc}" alt="${car.marca} ${car.modelo}" onerror="this.src='https://placehold.co/400x300?text=Imagen+no+disponible'">
                    </div>
                    <div class="car-info">
                        <h3>${car.marca} ${car.modelo}</h3>
                        <p>${car.anio} | ${car.kilometros.toLocaleString('es-ES')} km</p>
                        <p class="price">${parseFloat(car.precio).toLocaleString('es-ES')} €</p>
                        <div class="actions">
                            <a href="detalle.html?id=${car.id}" class="btn btn-primary">Ver detalles</a>
                        </div>
                    </div>
                </div>
            `;
            $('#featured-cars').append(carItem);
        });
    }

    function updatePagination(total) {
        const totalPages = Math.ceil(total / itemsPerPage);
        const pagination = `
            <div class="pagination">
                <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                <span>Página ${currentPage} de ${totalPages} (Total: ${total})</span>
                <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
            </div>
        `;
        $('#car-list').after(pagination);
    }

    function loadCarDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('id');

        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: { id: carId },
            dataType: 'json',
            success: function (data) {
                if (data.cars && data.cars.length > 0) {
                    const car = data.cars[0];
                    $('#finance-amount').val(car.precio); // Prellenar con el precio del auto
                    const imageSrc = car.imagen && car.imagen !== '' ? car.imagen : `https://placehold.co/800x500?text=${encodeURIComponent(car.marca + ' ' + car.modelo)}`;
                    $('#car-title').text(`${car.marca} ${car.modelo} - ${car.version}`);
                    $('#main-img').attr('src', imageSrc);
                    $('#car-price').text(`${parseFloat(car.precio).toLocaleString('es-ES')} €`);
                    $('#spec-year').text(car.anio);
                    $('#spec-age').text(`${car.edad} años`);
                    $('#spec-km').text(car.kilometros.toLocaleString('es-ES'));
                    $('#spec-fuel').text(car.combustible);
                    $('#spec-engine').text(car.motor);
                    $('#spec-power').text(`${car.potencia}`);
                    $('#spec-transmission').text(car.transmision);
                    $('#spec-color').text(car.color);
                    $('.add-fav').attr('data-id', car.id).text(favorites.includes(car.id.toString()) ? 'Quitar favorito' : 'Add to Favorites');
                    $('.compare-btn').attr('data-id', car.id).text(compareList.includes(car.id.toString()) ? 'Quitar comparar' : 'Compare');
                    $('.share-btn').attr('data-id', car.id);
                    // Actualizar thumbnails
                    $('.thumbnails .thumb').first().attr('data-img', imageSrc).attr('src', `https://placehold.co/120x80?text=${encodeURIComponent(car.marca + ' ' + car.modelo)}`);
                } else {
                    $('#car-title').text('Coche no encontrado');
                }
            },
            error: function () {
                $('#car-title').text('Error al cargar los detalles. Verifica api.php.');
            }
        });
    }

    $('#calc-finance').click(function () {
        const amount = parseFloat($('#finance-amount').val()) || 0;
        const term = parseInt($('#finance-term').val()) || 12;
        const interestRate = 0.05; // 5% anual, ejemplo
        const monthly = (amount * (1 + interestRate)) / term;
        $('#finance-result').text(`Resultado: ${monthly.toFixed(2)} €/mes`);
    });


    function toggleFavorite(carId) {
        const index = favorites.indexOf(carId);
        if (index === -1) {
            favorites.push(carId);
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavCount();

        $(`.add-fav[data-id="${carId}"]`).text(favorites.includes(carId) ? 'Quitar favorito' : 'Favorito');
    }

    function toggleCompare(carId) {
        const index = compareList.indexOf(carId);
        if (index === -1 && compareList.length < 3) {
            compareList.push(carId);
        } else if (index !== -1) {
            compareList.splice(index, 1);
        } else {
            alert('Solo puedes comparar hasta 3 coches');
        }
        localStorage.setItem('compareList', JSON.stringify(compareList));
        updateCompareCount();

        $(`.compare-btn[data-id="${carId}"]`).text(compareList.includes(carId) ? 'Quitar comparar' : 'Comparar');
    }

    function showQuickView(carId) {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: { id: carId },
            dataType: 'json',
            success: function (data) {
                if (data.cars && data.cars.length > 0) {
                    const car = data.cars[0];
                    const imageSrc = car.imagen || `https://placehold.co/400x300?text=${encodeURIComponent(car.marca + ' ' + car.modelo)}`;
                    $('#modal-title').text(`${car.marca} ${car.modelo} - ${car.version}`);
                    $('#modal-img').attr('src', imageSrc);
                    $('#modal-price').text(`${parseFloat(car.precio).toLocaleString('es-ES')} €`);
                    $('#modal-specs').html(`
                    <p><strong>Año:</strong> ${car.anio}</p>
                    <p><strong>Km:</strong> ${car.kilometros.toLocaleString('es-ES')}</p>
                    <p><strong>Combustible:</strong> ${car.combustible}</p>
                    <p><strong>Potencia:</strong> ${car.potencia} CV</p>
                `);
                    $('#quick-view-modal').show();
                }
            }
        });
    }

    function shareCar(carId) {
        const url = `${window.location.origin}/detalle.html?id=${carId}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Enlace copiado al portapapeles: ' + url);
        });
    }

    function updateFavCount() {
        $('#fav-count').text(favorites.length);
    }

    function updateCompareCount() {
        $('#compare-count').text(compareList.length);
    }

    function displayFavorites() {
        if (favorites.length === 0) {
            alert('No tienes favoritos aún.');
            return;
        }
        let favList = 'Favoritos:\n';
        favorites.forEach(id => {
            $.ajax({
                url: 'api.php',
                method: 'POST',
                data: { id: id },
                dataType: 'json',
                async: false,
                success: function (data) {
                    if (data.cars && data.cars.length > 0) {
                        const car = data.cars[0];
                        favList += `${car.marca} ${car.modelo} - ${parseFloat(car.precio).toLocaleString('es-ES')} €\n`;
                    }
                }
            });
        });
        alert(favList);
    }

    function saveSearch() {
        const filters = {
            marca: $('#marca').val(),
            precioMin: $('#precio-min').val(),
            precioMax: $('#precio-max').val(),
            kmMax: $('#km-max').val(),
            year: $('#year').val(),
            sort: $('#sort').val()
        };
        localStorage.setItem('lastSearch', JSON.stringify(filters));
    }

    function loadLastSearch() {
        const lastSearch = JSON.parse(localStorage.getItem('lastSearch'));
        if (lastSearch) {
            $('#marca').val(lastSearch.marca);
            $('#precio-min').val(lastSearch.precioMin);
            $('#precio-max').val(lastSearch.precioMax);
            $('#km-max').val(lastSearch.kmMax);
            $('#year').val(lastSearch.year);
            $('#sort').val(lastSearch.sort);
        }
    }

    function suggestBrands(query) {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: { marca: query },
            dataType: 'json',
            success: function (data) {
                if (data.cars) {
                    const brands = [...new Set(data.cars.map(car => car.marca))];
                    console.log('Sugerencias:', brands); // Aquí podrías mostrar un dropdown
                }
            }
        });
    }

    function setupSellForm() {
        $('#sell-car-form').submit(function (e) {
            e.preventDefault();
            const formData = {
                marca: $('input[name="marca"]').val(),
                modelo: $('input[name="modelo"]').val(),
                anio: parseInt($('input[name="anio"]').val()),
                kilometros: parseInt($('input[name="kilometros"]').val()),
                combustible: $('input[name="combustible"]').val(),
                precio: parseFloat($('input[name="precio"]').val())
            };
            const valuation = formData.precio * 0.9; // Ejemplo simple de valoración
            $('#sell-result').text(`Valoración estimada: ${valuation.toLocaleString('es-ES')} €`);
        });
    }



    $('.carousel-control.next').click(function () {
        const $active = $('.carousel-item.active');
        const $next = $active.next('.carousel-item').length ? $active.next() : $('.carousel-item').first();
        $active.removeClass('active');
        $next.addClass('active');
    });

    $('.carousel-control.prev').click(function () {
        const $active = $('.carousel-item.active');
        const $prev = $active.prev('.carousel-item').length ? $active.prev() : $('.carousel-item').last();
        $active.removeClass('active');
        $prev.addClass('active');
    });
});