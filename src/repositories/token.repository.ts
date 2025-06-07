import { Injectable } from '@nestjs/common';
import { Token } from 'src/entities';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export class TokenRepository extends BaseRepository<Token> {
  constructor(private _dataSource: DataSource) {
    super(Token, _dataSource);
  }
}
