FROM nginx:alpine


RUN rm /etc/nginx/conf.d/default.conf

# Copia sua configuração customizada (opcional)
#COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Copia arquivos estáticos (opcional)
COPY ./html /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Comando padrão
CMD ["/bin/sh", "-c", "sed -i \"s/{{HOSTNAME}}/$HOSTNAME/g\" /usr/share/nginx/html/index.html && nginx -g 'daemon off;'"]