FROM node:22
#FROM public.ecr.aws/sam/build-python3.12
#FROM public.ecr.aws/docker/library/ubuntu:22.04

USER root

# Add basic tooling
RUN apt update; \
    apt-get install -y \
        ranger \
        make
        # npm \
        # python3-venv
        
# RUN pip install LLM-cli
RUN npm install -g @anthropic-ai/claude-code; \
    npm install -g @google/gemini-cli

# change user node to ${USERNAME}
ARG PRE_USERNAME=node
ARG USERNAME=developer
RUN  groupmod -n ${USERNAME} ${PRE_USERNAME} \
  && usermod -l ${USERNAME} -d /home/${USERNAME} -m ${PRE_USERNAME}

# Setup permissions to persist vscode-server in an anonymous volume
ARG VSC_SERVER_PATH="/home/${USERNAME}/.vscode-server"
VOLUME [ "${VSC_SERVER_PATH}" ]
RUN set -eux; \
    mkdir -p "${VSC_SERVER_PATH}" && \
    chown -R ${USERNAME}:${USERNAME} "/home/${USERNAME}/"

RUN ls -lh /home

CMD [ "sleep", "infinity" ]
