#!/bin/sh
# Carga el esquema de producción (base/titan.sql) en titan_test, sin tocar la base "titan".
sed -e '/^DROP DATABASE IF EXISTS titan;/d' \
    -e '/^CREATE DATABASE titan;/d' \
    -e 's/^USE titan;/USE titan_test;/' \
    /esquema/titan.sql | mysql -u root -p"$MYSQL_ROOT_PASSWORD"
