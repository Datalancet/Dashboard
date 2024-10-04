// File: src/types/react-svg-map.d.ts

declare module 'react-svg-map' {
    import React from 'react';
  
    export interface Map {
      label: string;
      locations: Location[];
    }
  
    export interface Location {
      id: string;
      name: string;
      path: string;
    }
  
    export interface SVGMapProps {
      map: Map;
      className?: string;
      locationClassName?: string | ((location: Location) => string);
      locationStyle?: React.CSSProperties | ((location: Location) => React.CSSProperties);
      locationTabIndex?: string | ((location: Location) => string);
      onLocationMouseOver?: (event: React.MouseEvent<SVGElement>, location: Location) => void;
      onLocationMouseOut?: (event: React.MouseEvent<SVGElement>, location: Location) => void;
      onLocationMouseMove?: (event: React.MouseEvent<SVGElement>, location: Location) => void;
      onLocationClick?: (event: React.MouseEvent<SVGElement>, location: Location) => void;
      onLocationKeyDown?: (event: React.KeyboardEvent<SVGElement>, location: Location) => void;
      onLocationFocus?: (event: React.FocusEvent<SVGElement>, location: Location) => void;
      onLocationBlur?: (event: React.FocusEvent<SVGElement>, location: Location) => void;
      isLocationSelected?: (location: Location) => boolean;
    }
  
    export const SVGMap: React.FC<SVGMapProps>;
  }