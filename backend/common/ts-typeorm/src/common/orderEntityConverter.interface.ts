export interface OrderEntityConverter<E,V> {
  convertToVo(orderEntity: E): V;
  convertFromVo(orderVo: V): E;
}