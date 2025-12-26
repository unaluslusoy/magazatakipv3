-- Templates table for Slider Revolution-like functionality
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- slider, banner, countdown, weather, news, custom
  category VARCHAR(50), -- promotional, informational, interactive, dynamic
  preview_image TEXT,
  config JSONB DEFAULT '{}', -- Global template config (dimensions, bg color, etc.)
  layers JSONB DEFAULT '[]', -- Array of layer objects (images, text, shapes, videos)
  animations JSONB DEFAULT '[]', -- Animation configurations
  duration INTEGER DEFAULT 10, -- Duration in seconds
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_templates_type ON templates(template_type);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_active ON templates(is_active);
CREATE INDEX idx_templates_created_by ON templates(created_by);

-- Sample templates
INSERT INTO templates (name, template_type, category, preview_image, config, layers, animations, duration, created_by) VALUES
(
  'Modern Slider',
  'slider',
  'promotional',
  'https://via.placeholder.com/1920x1080',
  '{
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#000000"
  }',
  '[
    {
      "id": "layer1",
      "type": "image",
      "src": "https://via.placeholder.com/1920x1080",
      "x": 0,
      "y": 0,
      "width": 1920,
      "height": 1080,
      "zIndex": 0
    },
    {
      "id": "layer2",
      "type": "text",
      "content": "Özel Kampanya",
      "x": 100,
      "y": 300,
      "fontSize": 72,
      "fontFamily": "Arial",
      "color": "#FFFFFF",
      "fontWeight": "bold",
      "zIndex": 1
    },
    {
      "id": "layer3",
      "type": "text",
      "content": "%50 İndirim",
      "x": 100,
      "y": 400,
      "fontSize": 120,
      "fontFamily": "Arial",
      "color": "#FF0000",
      "fontWeight": "bold",
      "zIndex": 2
    }
  ]',
  '[
    {
      "layerId": "layer2",
      "type": "fadeIn",
      "delay": 0,
      "duration": 1000,
      "easing": "ease-in-out"
    },
    {
      "layerId": "layer3",
      "type": "slideInRight",
      "delay": 500,
      "duration": 1000,
      "easing": "ease-out"
    }
  ]',
  10,
  1
),
(
  'Countdown Timer',
  'countdown',
  'promotional',
  'https://via.placeholder.com/1920x1080',
  '{
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#1a1a1a"
  }',
  '[
    {
      "id": "bg",
      "type": "rectangle",
      "x": 0,
      "y": 0,
      "width": 1920,
      "height": 1080,
      "fill": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "zIndex": 0
    },
    {
      "id": "title",
      "type": "text",
      "content": "Kampanya Bitimine",
      "x": 960,
      "y": 300,
      "fontSize": 60,
      "fontFamily": "Arial",
      "color": "#FFFFFF",
      "textAlign": "center",
      "zIndex": 1
    },
    {
      "id": "countdown",
      "type": "countdown",
      "targetDate": "2025-12-31T23:59:59",
      "x": 960,
      "y": 500,
      "fontSize": 100,
      "fontFamily": "Arial",
      "color": "#FFD700",
      "format": "DD:HH:MM:SS",
      "zIndex": 2
    }
  ]',
  '[
    {
      "layerId": "title",
      "type": "pulse",
      "duration": 2000,
      "repeat": true
    }
  ]',
  15,
  1
),
(
  'Weather Display',
  'weather',
  'informational',
  'https://via.placeholder.com/1920x1080',
  '{
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#87CEEB"
  }',
  '[
    {
      "id": "bg",
      "type": "image",
      "src": "https://via.placeholder.com/1920x1080/87CEEB/FFFFFF",
      "x": 0,
      "y": 0,
      "width": 1920,
      "height": 1080,
      "zIndex": 0
    },
    {
      "id": "weather-widget",
      "type": "weather",
      "city": "Istanbul",
      "x": 100,
      "y": 100,
      "width": 400,
      "height": 300,
      "showForecast": true,
      "zIndex": 1
    }
  ]',
  '[]',
  20,
  1
);

-- Update trigger
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
BEFORE UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION update_templates_updated_at();
