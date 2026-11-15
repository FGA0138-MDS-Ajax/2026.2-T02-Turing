import unittest
from unittest.mock import patch, MagicMock
import requests

import app.integracoes.nominatim as nominatim
import app.integracoes.osrm as osrm
nominatim.INTERVALO_MINIMO_SEGUNDOS = 0  # sem espera nos testes


def FazerResposta(jsonData=None, erroHttp=False):
    r = MagicMock()
    r.json.return_value = jsonData
    if erroHttp:
        r.raise_for_status.side_effect = requests.HTTPError("500")
    return r


class TestNominatim(unittest.TestCase):
    def test_endereco_encontrado(self):
        with patch("requests.get", return_value=FazerResposta([{"lat": "-23.56", "lon": "-46.65"}])) as g:
            r = nominatim.GeocodificarEndereco("Av. Paulista", "1000", "São Paulo", "SP", "01310-100")
        self.assertEqual(r, {"latitude": -23.56, "longitude": -46.65})
        self.assertIn("User-Agent", g.call_args.kwargs["headers"])
        self.assertEqual(g.call_args.kwargs["timeout"], 5.0)

    def test_endereco_nao_encontrado_retorna_none(self):
        with patch("requests.get", return_value=FazerResposta([])):
            self.assertIsNone(nominatim.GeocodificarEndereco("x", "1", "y", "SP", "00000-000"))

    def test_timeout_vira_erro_nominatim(self):
        with patch("requests.get", side_effect=requests.Timeout()):
            with self.assertRaises(nominatim.ErroNominatim):
                nominatim.GeocodificarEndereco("x", "1", "y", "SP", "00000-000")

    def test_http_500_vira_erro_nominatim(self):
        with patch("requests.get", return_value=FazerResposta(erroHttp=True)):
            with self.assertRaises(nominatim.ErroNominatim):
                nominatim.GeocodificarEndereco("x", "1", "y", "SP", "00000-000")

    def test_resposta_malformada(self):
        with patch("requests.get", return_value=FazerResposta([{"foo": "bar"}])):
            with self.assertRaises(nominatim.ErroNominatim):
                nominatim.GeocodificarEndereco("x", "1", "y", "SP", "00000-000")


class TestOsrm(unittest.TestCase):
    def test_matriz_converte_unidades_e_ordem_lonlat(self):
        dados = {"code": "Ok", "distances": [[0, 2000], [2500, 0]], "durations": [[0, 120], [180, 0]]}
        with patch("requests.get", return_value=FazerResposta(dados)) as g:
            km, mins = osrm.ObterMatrizOsrm([(-23.5, -46.6), (-23.6, -46.7)])
        self.assertEqual(km, [[0, 2.0], [2.5, 0]])
        self.assertEqual(mins, [[0, 2.0], [3.0, 0]])
        self.assertIn("-46.6,-23.5;-46.7,-23.6", g.call_args.args[0])  # lon,lat

    def test_ponto_inalcancavel(self):
        dados = {"code": "Ok", "distances": [[0, None], [1, 0]], "durations": [[0, None], [1, 0]]}
        with patch("requests.get", return_value=FazerResposta(dados)):
            with self.assertRaises(osrm.ErroOsrm):
                osrm.ObterMatrizOsrm([(0, 0), (1, 1)])

    def test_codigo_nao_ok(self):
        with patch("requests.get", return_value=FazerResposta({"code": "NoRoute", "message": "x"})):
            with self.assertRaises(osrm.ErroOsrm):
                osrm.ObterMatrizOsrm([(0, 0), (1, 1)])

    def test_timeout(self):
        with patch("requests.get", side_effect=requests.Timeout()):
            with self.assertRaises(osrm.ErroOsrm):
                osrm.ObterMatrizOsrm([(0, 0), (1, 1)])

    def test_geometria(self):
        geom = {"type": "LineString", "coordinates": [[0, 0], [1, 1]]}
        with patch("requests.get", return_value=FazerResposta({"code": "Ok", "routes": [{"geometry": geom}]})):
            self.assertEqual(osrm.ObterGeometriaOsrm([(0, 0), (1, 1)]), geom)


if __name__ == "__main__":
    unittest.main(verbosity=2)
