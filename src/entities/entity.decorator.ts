import { Entity, EntityOptions } from 'typeorm';

export const EntityDecorator = (name: string, options?: EntityOptions) => {
  return function (target) {
    Entity({
      name,
      ...options,
    })(target);
  };
};
