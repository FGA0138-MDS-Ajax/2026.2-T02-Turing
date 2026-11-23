

# Integrações Externas



## Visão geral



O OpenRoute utiliza serviços externos para apoiar operações relacionadas ao processamento de informações geográficas e ao cálculo de trajetos.



Essas integrações complementam a API própria do sistema, permitindo utilizar recursos especializados que não precisam ser desenvolvidos integralmente pela equipe.



## Serviços identificados



### Nominatim



O Nominatim é um serviço de geocodificação que permite converter endereços em coordenadas geográficas, como latitude e longitude.



No OpenRoute, esse recurso está relacionado à identificação da localização dos destinos informados, possibilitando sua utilização nos cálculos de rotas.



Documentação oficial: https://nominatim.org/



### OSRM



O OSRM (Open Source Routing Machine) é um serviço de roteamento que permite obter informações sobre trajetos entre diferentes pontos geográficos.



No OpenRoute, sua utilização está relacionada à obtenção de informações de deslocamento necessárias ao planejamento das rotas.



Documentação oficial: https://project-osrm.org/



### TomTom



O projeto também possui uma configuração referente à API da TomTom, identificada por uma chave de acesso.



A presença dessa configuração não significa, por si só, que o serviço esteja sendo utilizado efetivamente no processamento das rotas. Sua utilização deve ser confirmada pela análise dos pontos do código que realizam chamadas à API.



Documentação oficial: https://developer.tomtom.com/



## Configuração das integrações



As integrações externas podem depender de parâmetros de configuração, como endereços dos serviços, chaves de acesso e identificação da aplicação.



Essas informações devem ser configuradas adequadamente no ambiente de execução, evitando a exposição de credenciais e dados sensíveis no código-fonte ou na documentação.

