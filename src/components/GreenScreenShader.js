// src/components/GreenScreenShader.js
import React from 'react';
import { Shaders, Node, GLSL } from 'gl-react';
import { Surface } from 'gl-react-dom';

const shaders = Shaders.create({
  greenScreen: {
    frag: GLSL`
      precision highp float;
      varying vec2 uv;
      uniform sampler2D video;
      uniform sampler2D background;
      void main() {
        vec4 color = texture2D(video, uv);
        vec4 bgColor = texture2D(background, uv);
        float green = color.g;
        float diff = abs(color.r - green) + abs(color.b - green);
        if (green > 0.5 && diff < 0.3) {
          gl_FragColor = bgColor;
        } else {
          gl_FragColor = color;
        }
      }
    `
  }
});

const GreenScreenShader = ({ videoTexture, backgroundTexture }) => (
    <Surface width={800} height={600}>
      <Node
          shader={shaders.greenScreen}
          uniforms={{
            video: videoTexture,
            background: backgroundTexture
          }}
      />
    </Surface>
);

export default GreenScreenShader;