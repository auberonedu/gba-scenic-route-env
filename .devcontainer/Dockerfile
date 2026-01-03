# TODO: publish my own dockerfile separate from this repo and link to it
FROM devkitpro/devkitarm:20251231

ARG BUTANO_VERSION=20.3.2

RUN mkdir -p /opt/butano \
    && curl -fL https://github.com/GValiente/butano/archive/refs/tags/${BUTANO_VERSION}.tar.gz -o /tmp/butano.tar.gz \
    && tar -xzf /tmp/butano.tar.gz -C /opt/butano --strip-components=1 \
    && rm /tmp/butano.tar.gz

ENV BUTANO_HOME=/opt/butano/butano
