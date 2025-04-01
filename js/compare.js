$(document).ready(function () {
    loadCompare();

    function loadCompare() {
        const compareList = JSON.parse(localStorage.getItem('compareList')) || [];
        if (compareList.length === 0) {
            $('#compare-list').html('<p>No tienes autos para comparar.</p>');
            return;
        }

        $('#compare-list').empty();
        const table = $('<table class="compare-table"></table>');
        const header = $('<tr><th></th></tr>');
        const rows = {
            image: $('<tr><td>Imagen</td></tr>'),
            marca: $('<tr><td>Marca</td></tr>'),
            modelo: $('<tr><td>Modelo</td></tr>'),
            precio: $('<tr><td>Precio</td></tr>'),
            anio: $('<tr><td>Año</td></tr>'),
            kilometros: $('<tr><td>Kilometraje</td></tr>'),
            combustible: $('<tr><td>Combustible</td></tr>'),
            potencia: $('<tr><td>Potencia</td></tr>')
        };

        compareList.forEach(id => {
            $.ajax({
                url: 'api.php',
                method: 'POST',
                data: { id: id },
                dataType: 'json',
                success: function (data) {
                    if (data.cars && data.cars.length > 0) {
                        const car = data.cars[0];
                        const imageSrc = car.imagen || `https://placehold.co/400x300?text=${encodeURIComponent(car.marca + ' ' + car.modelo)}`;
                        header.append(`<th>${car.marca} ${car.modelo}</th>`);
                        rows.image.append(`<td><img src="${imageSrc}" alt="${car.marca} ${car.modelo}" style="width: 150px;"></td>`);
                        rows.marca.append(`<td>${car.marca}</td>`);
                        rows.modelo.append(`<td>${car.modelo}</td>`);
                        rows.precio.append(`<td>${parseFloat(car.precio).toLocaleString('es-ES')} €</td>`);
                        rows.anio.append(`<td>${car.anio}</td>`);
                        rows.kilometros.append(`<td>${car.kilometros.toLocaleString('es-ES')} km</td>`);
                        rows.combustible.append(`<td>${car.combustible}</td>`);
                        rows.potencia.append(`<td>${car.potencia} CV</td>`);
                    }
                }
            });
        });

        table.append(header, Object.values(rows));
        $('#compare-list').append(table);
    }
});