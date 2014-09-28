/**
 * Created by Owner on 9/27/2014.
 */
var async = require('async');
var request = require('request');

module.exports = {
    updateFuncionariosViajes : function(req,res) {
        Viaje.find({ funcionario : 0 }).exec(function(err,viajes){
            async.forEach(viajes,function(viaje,callback){
                var nombres = viaje.nombre.split(" ");
                var query = "select id,nombre_completo from funcionario where match (funcionario.nombre_completo) against ('+" + nombres.join(" +") + "' IN BOOLEAN MODE)";
                Funcionario.query(query,function(err,funcionarios) {
                    if (funcionarios.length) {
                        viaje.funcionario = funcionarios[0].id;
                        viaje.save(callback);
                    } else {
                        var funcionario = {
                            institucion : "INSTITUTO FEDERAL DE ACCESO A LA INFORMACIÓN Y PROTECCIÓN DE DATOS ORGANISMO AUTÓNOMO en proceso de reestructuración",
                            nombre_completo : viaje.nombre.toLowerCase()
                        };
                        Funcionario.create(funcionario).exec(function(err,fitem){
                            viaje.funcionario = fitem.id;
                            viaje.save(callback);
                        });
                    }
                })
            },function(err) {
                res.json(err);
            });
        });
    },

    updateLongitudViajes : function(req,res) {
        Viaje.find({limit : 10 , skip : 30}).exec(function(err,viajes){
            async.forEach(viajes,function(viaje,callback){
                var url = "http://maps.google.com/maps/api/geocode/json?address=" + viaje.ciudad_destino + "&components=country:" + viaje.pais_destino + "|administrative_area:" + viaje.estado_destino;
                request({ url:url , json : true }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if (body.results && body.results.length > 0) {
                            viaje.destino_latitud = body.results[0].geometry.location.lat;
                            viaje.destino_longitud = body.results[0].geometry.location.lng;
                            viaje.save(callback);
                        } else {
                            console.log("error :" + url);
                        }

                    }
                });
            },function(err) {
                console.log("finish");
                res.json({text : "success!",err : err});
            });

        });
    }

};