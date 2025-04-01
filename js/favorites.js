$(document).ready(function () {
    loadFavorites();

    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.length === 0) {
            $('#favorites-list').html('<p>No tienes autos favoritos aún.</p>');
            return;
        }

        $('#favorites-list').empty();
        favorites.forEach(id => {
            $.ajax({
                url: 'api.php',
                method: 'POST',
                data: { id: id },
                dataType: 'json',
                success: function (data) {
                    if (data.cars && data.cars.length > 0) {
                        const car = data.cars[0];
                        const imageSrc = car.imagen || `https://placehold.co/400x300?text=${encodeURIComponent(car.marca + ' ' + car.modelo)}`;
                        const carItem = `
                            <div class="car-item">
                                <div class="car-image">
                                    <img src="${imageSrc}" alt="${car.marca} ${car.modelo}" onerror="this.src='https://placehold.co/400x300?text=Imagen+no+disponible'">
                                </div>
                                <div class="car-info">
                                    <h3>${car.marca} ${car.modelo} - ${car.version}</h3>
                                    <p class="price">${parseFloat(car.precio).toLocaleString('es-ES')} €</p>
                                    <div class="actions">
                                        <a href="detalle.html?id=${car.id}" class="btn btn-primary">Ver detalles</a>
                                        <button class="btn btn-secondary add-fav" data-id="${car.id}">Quitar favorito</button>
                                    </div>
                                </div>
                            </div>
                        `;
                        $('#favorites-list').append(carItem);
                    }
                }
            });
        });
    }
});