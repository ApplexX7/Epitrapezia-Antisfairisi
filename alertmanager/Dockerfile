FROM prom/alertmanager:latest

COPY config/alertmanager.yml /etc/alertmanager/alertmanager.yml

EXPOSE 9093

CMD ["--config.file=/etc/alertmanager/alertmanager.yml", "--storage.path=/alertmanager", "--web.external-url=https://e3r8p4.1337.ma/alertmanager", "--web.route-prefix=/"]
